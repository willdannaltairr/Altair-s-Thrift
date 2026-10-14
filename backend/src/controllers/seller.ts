import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { ok, fail } from '../utils/response.js';

async function sellerStoreIds(userId: string): Promise<string[]> {
  const stores = await prisma.store.findMany({ where: { ownerId: userId }, select: { id: true } });
  return stores.map((s) => s.id);
}

function revenueWhere(storeIds: string[]) {
  return { storeId: { in: storeIds }, paymentStatus: 'PAID' as const };
}

export async function dashboard(req: Request, res: Response) {
  const ids = await sellerStoreIds(req.user!.id);
  if (ids.length === 0) return ok(res, { empty: true });
  const [orders, products, revenueAgg, recent] = await Promise.all([
    prisma.order.count({ where: { storeId: { in: ids }, paymentStatus: { in: ['PAID'] } } }),
    prisma.product.count({ where: { storeId: { in: ids }, status: 'PUBLISHED' } }),
    prisma.order.aggregate({ where: revenueWhere(ids), _sum: { total: true } }),
    prisma.order.findMany({ where: { storeId: { in: ids } }, include: { items: true }, orderBy: { createdAt: 'desc' }, take: 8 }),
  ]);
  const soldAgg = await prisma.inventory.aggregate({ where: { product: { storeId: { in: ids } } }, _sum: { sold: true } });
  const lowStock = await prisma.product.findMany({ where: { storeId: { in: ids }, stock: { lte: 3 }, status: 'PUBLISHED' }, take: 10, include: { images: { take: 1 } } });
  const top = await prisma.inventory.findMany({
    where: { product: { storeId: { in: ids } } },
    orderBy: { sold: 'desc' },
    take: 5,
    include: { product: { select: { name: true, price: true } } },
  });
  // Revenue is sum of eligible paid orders only
  return ok(res, {
    totalRevenue: revenueAgg._sum.total ?? 0,
    revenueNote: 'Sum of PAID orders only',
    totalOrders: orders,
    productsSold: soldAgg._sum.sold ?? 0,
    activeProducts: products,
    lowStock,
    recentOrders: recent,
    topProducts: top,
  });
}

export async function analytics(req: Request, res: Response) {
  const ids = await sellerStoreIds(req.user!.id);
  const orders = await prisma.order.findMany({
    where: { storeId: { in: ids }, paymentStatus: 'PAID' },
    select: { total: true, createdAt: true, items: { select: { qty: true, productId: true, snapshotName: true, subtotal: true } } },
    orderBy: { createdAt: 'asc' },
    take: 500,
  });
  const byDay = new Map<string, { revenue: number; orders: number; units: number }>();
  let units = 0;
  for (const o of orders) {
    const day = o.createdAt.toISOString().slice(0, 10);
    const cur = byDay.get(day) ?? { revenue: 0, orders: 0, units: 0 };
    const u = o.items.reduce((s, i) => s + i.qty, 0);
    units += u;
    byDay.set(day, { revenue: cur.revenue + o.total, orders: cur.orders + 1, units: cur.units + u });
  }
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const aov = orders.length ? Math.round(revenue / orders.length) : 0;
  const best = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const o of orders) for (const i of o.items) {
    const cur = best.get(i.productId ?? i.snapshotName) ?? { name: i.snapshotName, qty: 0, revenue: 0 };
    cur.qty += i.qty; cur.revenue += i.subtotal;
    best.set(i.productId ?? i.snapshotName, cur);
  }
  return ok(res, {
    revenue, totalOrders: orders.length, unitsSold: units, aov,
    trend: [...byDay.entries()].map(([date, v]) => ({ date, ...v })),
    bestSellers: [...best.values()].sort((a, b) => b.qty - a.qty).slice(0, 10),
  });
}

export async function sellerOrders(req: Request, res: Response) {
  const ids = await sellerStoreIds(req.user!.id);
  const orders = await prisma.order.findMany({
    where: { storeId: { in: ids } },
    include: { items: true, payment: true, shipment: true, customer: { select: { fullName: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return ok(res, orders);
}

export async function inventory(req: Request, res: Response) {
  const ids = await sellerStoreIds(req.user!.id);
  const rows = await prisma.product.findMany({
    where: { storeId: { in: ids } },
    include: { inventory: true, images: { take: 1 } },
    orderBy: { updatedAt: 'desc' },
    take: 200,
  });
  return ok(res, rows.map((p) => ({
    id: p.id, name: p.name, slug: p.slug, stock: p.stock,
    available: p.inventory?.available ?? p.stock,
    reserved: p.inventory?.reserved ?? 0,
    sold: p.inventory?.sold ?? 0,
    status: p.inventory && p.stock <= p.inventory.lowThreshold ? 'LOW' : p.stock === 0 ? 'OUT' : 'OK',
    image: p.images[0]?.url ?? null,
  })));
}

export async function updateInventory(req: Request, res: Response) {
  const { id } = req.params;
  const { stock } = req.body as { stock: number };
  if (Number(stock) < 0) return fail(res, 400, 'Stock cannot be negative');
  const product = await prisma.product.findUnique({ where: { id }, include: { store: true } });
  if (!product || product.store.ownerId !== req.user!.id) return fail(res, 403, 'Forbidden');
  const updated = await prisma.$transaction(async (tx) => {
    const p = await tx.product.update({ where: { id }, data: { stock: Number(stock) } });
    await tx.inventory.upsert({
      where: { productId: id },
      update: { available: Number(stock) },
      create: { productId: id, available: Number(stock) },
    });
    await tx.inventoryMovement.create({ data: { productId: id, type: 'ADJUST', qty: Number(stock) - product.stock, note: 'seller adjust' } });
    return p;
  });
  return ok(res, updated, 'Inventory updated');
}

export async function applyVerification(req: Request, res: Response) {
  const { identityName, businessName, businessDesc, contact, location, storeId } = req.body as Record<string, string>;
  const row = await prisma.sellerVerification.create({
    data: { userId: req.user!.id, identityName, businessName, businessDesc, contact, location, storeId: storeId ?? undefined },
  });
  return ok(res, row, 'Verification submitted');
}
