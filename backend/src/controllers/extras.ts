import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { ok, created, fail } from '../utils/response.js';

export async function listAddresses(req: Request, res: Response) {
  const rows = await prisma.shippingAddress.findMany({ where: { userId: req.user!.id }, orderBy: { isDefault: 'desc' } });
  return ok(res, rows);
}

export async function createAddress(req: Request, res: Response) {
  const data = req.body as Record<string, string | boolean>;
  if (data.isDefault) {
    await prisma.shippingAddress.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } });
  }
  const row = await prisma.shippingAddress.create({
    data: {
      userId: req.user!.id,
      label: String(data.label ?? 'Home'),
      recipient: String(data.recipient),
      phone: String(data.phone),
      address: String(data.address),
      city: String(data.city),
      province: String(data.province),
      postalCode: String(data.postalCode),
      isDefault: Boolean(data.isDefault ?? false),
    },
  });
  return created(res, row, 'Address saved');
}

export async function createReview(req: Request, res: Response) {
  const { orderItemId, rating, comment } = req.body as { orderItemId: string; rating: number; comment?: string };
  const item = await prisma.orderItem.findUnique({ where: { id: orderItemId }, include: { order: true } });
  if (!item || item.order.customerId !== req.user!.id) return fail(res, 404, 'Order item not found');
  if (!['DELIVERED', 'COMPLETED'].includes(item.order.orderStatus)) {
    return fail(res, 400, 'You can review only completed/delivered purchases');
  }
  const existing = await prisma.review.findUnique({ where: { orderItemId } });
  if (existing) return fail(res, 409, 'Already reviewed');
  if (!item.productId) return fail(res, 400, 'Product archived');
  const product = await prisma.product.findUnique({ where: { id: item.productId } });
  const review = await prisma.review.create({
    data: {
      orderItemId, productId: item.productId, customerId: req.user!.id,
      storeId: item.order.storeId, rating: Number(rating), comment, isVerifiedPurchase: true,
    },
  });
  void product;
  return created(res, review, 'Review published');
}

export async function createReport(req: Request, res: Response) {
  const { targetType, targetId, reason, description } = req.body as Record<string, string>;
  const report = await prisma.report.create({
    data: { reporterId: req.user!.id, targetType: targetType as never, targetId, reason, description },
  });
  return created(res, report, 'Report submitted');
}
