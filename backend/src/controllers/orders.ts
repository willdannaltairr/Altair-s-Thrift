import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { ok, fail, created } from '../utils/response.js';
import { orderNumber } from '../utils/slug.js';
import { newIdempotencyKey } from '../utils/payment.js';

const SHIPPING_FLAT: Record<string, number> = { JNE: 15000, JNT: 14000, SICEPAT: 16000, GOJEK: 20000, POS: 12000 };

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING_PAYMENT: ['PAID', 'CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED', 'REFUNDED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
  REFUNDED: [],
};

export async function checkout(req: Request, res: Response) {
  const userId = req.user!.id;
  const { addressId, courier = 'JNE', notes } = req.body as { addressId: string; courier?: string; notes?: string };
  const address = await prisma.shippingAddress.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== userId) return fail(res, 404, 'Address not found');
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: { include: { store: true } } } } },
  });
  if (!cart || cart.items.length === 0) return fail(res, 400, 'Cart is empty');

  // Group by store — MVP creates separate seller orders
  const byStore = new Map<string, typeof cart.items>();
  for (const it of cart.items) {
    if (it.product.status !== 'PUBLISHED') return fail(res, 400, `${it.product.name} is no longer available`);
    if (it.qty > it.product.stock) return fail(res, 400, `${it.product.name}: only ${it.product.stock} left`);
    const arr = byStore.get(it.product.storeId) ?? [];
    arr.push(it);
    byStore.set(it.product.storeId, arr);
  }

  const shippingCost = SHIPPING_FLAT[String(courier).toUpperCase()] ?? 15000;
  const createdOrders = await prisma.$transaction(async (tx) => {
    const orders = [];
    for (const [storeId, items] of byStore) {
      // Re-validate + decrement atomically to prevent oversell / double-sell last item
      for (const it of items) {
        const fresh = await tx.product.findUnique({ where: { id: it.productId } });
        if (!fresh || fresh.status !== 'PUBLISHED') throw new Error(`${it.product.name} unavailable`);
        if (fresh.stock < it.qty) throw new Error(`${it.product.name}: only ${fresh.stock} left`);
      }
      const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
      const total = subtotal + shippingCost;
      const order = await tx.order.create({
        data: {
          orderNumber: orderNumber(),
          customerId: userId,
          storeId,
          shippingAddressId: addressId,
          subtotal,
          shippingCost,
          total,
          notes,
          paymentStatus: 'PENDING',
          orderStatus: 'PENDING_PAYMENT',
          items: {
            create: items.map((i) => ({
              productId: i.productId,
              snapshotName: i.product.name,
              snapshotPrice: i.product.price,
              snapshotImage: undefined,
              snapshotBrand: i.product.brand,
              qty: i.qty,
              subtotal: i.product.price * i.qty,
            })),
          },
        },
        include: { items: true },
      });
      // Reserve stock via transaction: decrement available, increment reserved
      for (const it of items) {
        const upd = await tx.product.updateMany({
          where: { id: it.productId, stock: { gte: it.qty } },
          data: { stock: { decrement: it.qty } },
        });
        if (upd.count === 0) throw new Error(`${it.product.name} just sold out`);
        await tx.inventory.upsert({
          where: { productId: it.productId },
          update: { available: { decrement: it.qty }, reserved: { increment: it.qty } },
          create: { productId: it.productId, available: 0, reserved: it.qty },
        });
        await tx.inventoryMovement.create({ data: { productId: it.productId, type: 'RESERVE', qty: it.qty, refOrderId: order.id } });
        await tx.inventoryReservation.create({
          data: { productId: it.productId, orderId: order.id, qty: it.qty, expiresAt: new Date(Date.now() + 24 * 3600 * 1000), status: 'ACTIVE' },
        });
      }
      await tx.payment.create({
        data: {
          orderId: order.id,
          provider: 'sandbox',
          providerRef: `SBX-${order.orderNumber}`,
          idempotencyKey: newIdempotencyKey(),
          amount: total,
          status: 'PENDING',
        },
      });
      await tx.shipment.create({ data: { orderId: order.id, courier: String(courier).toUpperCase(), shippingCost, status: 'PENDING', isSimulated: true } });
      orders.push(order);
    }
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return orders;
  }).catch((e: unknown) => {
    const msg = e instanceof Error ? e.message : 'Checkout failed';
    return { __error: msg } as unknown as never;
  });

  if ((createdOrders as unknown as { __error?: string }).__error) {
    return fail(res, 400, (createdOrders as unknown as { __error: string }).__error);
  }
  return created(res, createdOrders, 'Order created — proceed to payment');
}

export async function myOrders(req: Request, res: Response) {
  const orders = await prisma.order.findMany({
    where: { customerId: req.user!.id },
    include: { items: true, payment: true, shipment: true, store: { select: { name: true, slug: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return ok(res, orders);
}

export async function getOrder(req: Request, res: Response) {
  const { id } = req.params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, payment: true, shipment: true, store: true, customer: { select: { fullName: true, email: true } } },
  });
  if (!order) return fail(res, 404, 'Order not found');
  const isCustomer = order.customerId === req.user!.id;
  const isAdmin = req.user!.roles.includes('ADMIN');
  const ownStore = await prisma.store.findFirst({ where: { id: order.storeId, ownerId: req.user!.id } });
  if (!isCustomer && !isAdmin && !ownStore) return fail(res, 403, 'Forbidden');
  return ok(res, order);
}

export async function updateOrderStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status, trackingNumber, courier } = req.body as { status: string; trackingNumber?: string; courier?: string };
  const order = await prisma.order.findUnique({ where: { id }, include: { store: true } });
  if (!order) return fail(res, 404, 'Order not found');
  const isSeller = order.store.ownerId === req.user!.id;
  const isAdmin = req.user!.roles.includes('ADMIN');
  const isCustomer = order.customerId === req.user!.id;
  // Customers may only complete delivered orders; cannot mark unpaid as completed
  if (isCustomer && !isSeller && !isAdmin) {
    if (status !== 'COMPLETED' || order.orderStatus !== 'DELIVERED') return fail(res, 403, 'Forbidden');
  } else if (!isSeller && !isAdmin) {
    return fail(res, 403, 'Forbidden');
  }
  const allowed = VALID_TRANSITIONS[order.orderStatus] ?? [];
  if (!allowed.includes(status)) return fail(res, 400, `Invalid transition ${order.orderStatus} → ${status}`);
  if ((status === 'PROCESSING' || status === 'SHIPPED') && order.paymentStatus !== 'PAID') {
    return fail(res, 400, 'Order must be paid first');
  }
  const updated = await prisma.$transaction(async (tx) => {
    const o = await tx.order.update({ where: { id }, data: { orderStatus: status as never } });
    if (status === 'SHIPPED' || status === 'PROCESSING') {
      await tx.shipment.update({
        where: { orderId: id },
        data: {
          status: status === 'SHIPPED' ? 'SHIPPED' : 'READY_TO_SHIP',
          trackingNumber: trackingNumber ?? undefined,
          courier: courier ?? undefined,
          shippedAt: status === 'SHIPPED' ? new Date() : undefined,
        },
      });
    }
    if (status === 'DELIVERED') {
      await tx.shipment.update({ where: { orderId: id }, data: { status: 'DELIVERED', deliveredAt: new Date() } });
    }
    if (status === 'COMPLETED') {
      // convert reservations, increment sold
      const res2 = await tx.inventoryReservation.findMany({ where: { orderId: id, status: 'ACTIVE' } });
      for (const r of res2) {
        await tx.inventoryReservation.update({ where: { id: r.id }, data: { status: 'CONVERTED' } });
        await tx.inventory.update({ where: { productId: r.productId }, data: { reserved: { decrement: r.qty }, sold: { increment: r.qty } } });
        await tx.inventoryMovement.create({ data: { productId: r.productId, type: 'SALE', qty: r.qty, refOrderId: id } });
      }
    }
    if (status === 'CANCELLED') {
      // release inventory
      const res2 = await tx.inventoryReservation.findMany({ where: { orderId: id, status: 'ACTIVE' } });
      for (const r of res2) {
        await tx.inventoryReservation.update({ where: { id: r.id }, data: { status: 'RELEASED' } });
        await tx.product.update({ where: { id: r.productId }, data: { stock: { increment: r.qty } } });
        await tx.inventory.update({ where: { productId: r.productId }, data: { reserved: { decrement: r.qty }, available: { increment: r.qty } } });
        await tx.inventoryMovement.create({ data: { productId: r.productId, type: 'RELEASE', qty: r.qty, refOrderId: id } });
      }
    }
    return o;
  });
  return ok(res, updated, `Order ${status}`);
}
