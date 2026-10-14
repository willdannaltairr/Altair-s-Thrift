import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { ok, fail } from '../utils/response.js';

export async function overview(_req: Request, res: Response) {
  const [users, sellers, products, orders, pendingSellers, pendingProducts] = await Promise.all([
    prisma.user.count(),
    prisma.userRole.count({ where: { role: { name: 'SELLER' } } }),
    prisma.product.count(),
    prisma.order.count(),
    prisma.sellerVerification.count({ where: { status: 'PENDING' } }),
    prisma.product.count({ where: { status: 'PENDING_REVIEW' } }),
  ]);
  return ok(res, { users, sellers, products, orders, pendingSellers, pendingProducts });
}

export async function listUsers(req: Request, res: Response) {
  const q = String((req.query as Record<string, string>).q ?? '');
  const users = await prisma.user.findMany({
    where: q ? { OR: [{ email: { contains: q, mode: 'insensitive' } }, { fullName: { contains: q, mode: 'insensitive' } }] } : undefined,
    select: { id: true, email: true, fullName: true, status: true, createdAt: true, roles: { include: { role: true } } },
    take: 50,
    orderBy: { createdAt: 'desc' },
  });
  return ok(res, users);
}

export async function patchUser(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body as { status: 'ACTIVE' | 'SUSPENDED' | 'BANNED' };
  if (!['ACTIVE', 'SUSPENDED', 'BANNED'].includes(status)) return fail(res, 400, 'Invalid status');
  const u = await prisma.user.update({ where: { id }, data: { status } });
  await prisma.auditLog.create({ data: { actorId: req.user!.id, action: `user.${status}`, entity: 'User', entityId: id } });
  return ok(res, { id: u.id, status: u.status });
}

export async function listVerifications(_req: Request, res: Response) {
  const rows = await prisma.sellerVerification.findMany({
    where: { status: 'PENDING' },
    include: { user: { select: { email: true, fullName: true } }, store: { select: { name: true, slug: true } } },
    orderBy: { createdAt: 'asc' },
  });
  return ok(res, rows);
}

export async function verifySeller(req: Request, res: Response) {
  const { id } = req.params;
  const { action, reason } = req.body as { action: 'APPROVE' | 'REJECT'; reason?: string };
  const v = await prisma.sellerVerification.findUnique({ where: { id } });
  if (!v) return fail(res, 404, 'Not found');
  const status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.sellerVerification.update({ where: { id }, data: { status: status as never, rejectReason: reason, reviewedById: req.user!.id } });
    if (status === 'APPROVED' && v.storeId) {
      await tx.store.update({ where: { id: v.storeId }, data: { isVerified: true } });
    }
    await tx.auditLog.create({ data: { actorId: req.user!.id, action: `seller.${status}`, entity: 'SellerVerification', entityId: id, metadata: { reason } } });
    return row;
  });
  return ok(res, updated, `Seller ${status}`);
}

export async function pendingProducts(_req: Request, res: Response) {
  const rows = await prisma.product.findMany({
    where: { status: 'PENDING_REVIEW' },
    include: { store: { select: { name: true, slug: true } }, images: { take: 1 } },
    orderBy: { createdAt: 'asc' },
    take: 100,
  });
  return ok(res, rows);
}

export async function moderateProduct(req: Request, res: Response) {
  const { id } = req.params;
  const { action, reason } = req.body as { action: 'APPROVE' | 'REJECT' | 'ARCHIVE'; reason?: string };
  const status = action === 'APPROVE' ? 'PUBLISHED' : action === 'REJECT' ? 'REJECTED' : 'ARCHIVED';
  const p = await prisma.product.update({ where: { id }, data: { status: status as never } });
  await prisma.auditLog.create({ data: { actorId: req.user!.id, action: `product.${status}`, entity: 'Product', entityId: id, metadata: { reason } } });
  return ok(res, p, `Product ${status}`);
}

export async function adminOrders(_req: Request, res: Response) {
  const orders = await prisma.order.findMany({ include: { store: { select: { name: true } }, payment: true }, orderBy: { createdAt: 'desc' }, take: 100 });
  return ok(res, orders);
}

export async function listReports(_req: Request, res: Response) {
  const rows = await prisma.report.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  return ok(res, rows);
}

export async function resolveReport(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body as { status: 'RESOLVED' | 'REJECTED' | 'REVIEWING' };
  const row = await prisma.report.update({ where: { id }, data: { status: status as never } });
  return ok(res, row, `Report ${status}`);
}
