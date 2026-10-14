import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { ok, fail, created } from '../utils/response.js';

async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) cart = await prisma.cart.create({ data: { userId } });
  return cart;
}

export async function getCart(req: Request, res: Response) {
  const cart = await getOrCreateCart(req.user!.id);
  const full = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { take: 1 },
              store: { select: { name: true, slug: true } },
            },
          },
        },
      },
    },
  });
  const subtotal = (full?.items ?? []).reduce((s, it) => s + it.product.price * it.qty, 0);
  return ok(res, { ...full, subtotal, totalQty: full?.items.reduce((s, i) => s + i.qty, 0) ?? 0 });
}

export async function addItem(req: Request, res: Response) {
  const { productId, qty } = req.body as { productId: string; qty: number };
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== 'PUBLISHED') return fail(res, 404, 'Product not available');
  if (product.stock < qty) return fail(res, 400, `Only ${product.stock} in stock`);
  const cart = await getOrCreateCart(req.user!.id);
  const existing = await prisma.cartItem.findUnique({ where: { cartId_productId: { cartId: cart.id, productId } } });
  const nextQty = (existing?.qty ?? 0) + qty;
  if (nextQty > product.stock) return fail(res, 400, `Cannot exceed available stock (${product.stock})`);
  const item = existing
    ? await prisma.cartItem.update({ where: { id: existing.id }, data: { qty: nextQty } })
    : await prisma.cartItem.create({ data: { cartId: cart.id, productId, qty } });
  return created(res, item, 'Added to cart');
}

export async function patchItem(req: Request, res: Response) {
  const { id } = req.params;
  const { qty } = req.body as { qty: number };
  const item = await prisma.cartItem.findUnique({ where: { id }, include: { cart: true, product: true } });
  if (!item || item.cart.userId !== req.user!.id) return fail(res, 404, 'Cart item not found');
  if (qty > item.product.stock) return fail(res, 400, `Only ${item.product.stock} in stock`);
  const updated = await prisma.cartItem.update({ where: { id }, data: { qty } });
  return ok(res, updated, 'Cart updated');
}

export async function removeItem(req: Request, res: Response) {
  const { id } = req.params;
  const item = await prisma.cartItem.findUnique({ where: { id }, include: { cart: true } });
  if (!item || item.cart.userId !== req.user!.id) return fail(res, 404, 'Cart item not found');
  await prisma.cartItem.delete({ where: { id } });
  return ok(res, null, 'Removed from cart');
}
