import type { Request, Response } from 'express';
import crypto from 'node:crypto';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { ok, fail, created } from '../utils/response.js';
import { verifyWebhookSignature } from '../utils/payment.js';

/** Sandbox simulation — clearly labelled dev-only. Production should plug Midtrans/Xendit here. */
export async function createPayment(req: Request, res: Response) {
  const { orderId, method } = req.body as { orderId: string; method?: string };
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payment: true } });
  if (!order || order.customerId !== req.user!.id) return fail(res, 404, 'Order not found');
  if (order.paymentStatus === 'PAID') return fail(res, 400, 'Already paid');
  if (order.total <= 0) return fail(res, 400, 'Invalid amount');
  const payment = await prisma.payment.upsert({
    where: { orderId },
    update: { provider: 'sandbox', payload: JSON.stringify({ method: method ?? 'QRIS_SANDBOX' }) },
    create: {
      orderId,
      provider: 'sandbox',
      providerRef: `SBX-${order.orderNumber}`,
      idempotencyKey: crypto.randomUUID(),
      amount: order.total,
      status: 'PENDING',
      payload: JSON.stringify({ method: method ?? 'QRIS_SANDBOX' }),
    },
  });
  // Sandbox checkout URL (frontend polls / simulates). Real gateway would return gateway URL.
  return created(res, { payment, checkoutUrl: `${env.FRONTEND_URL}/checkout/pay/${order.id}?ref=${payment.providerRef}`, sandbox: true }, 'Payment initiated (SANDBOX)');
}

export async function simulatePay(req: Request, res: Response) {
  const { orderId, succeed = true } = req.body as { orderId: string; succeed?: boolean };
  if (env.NODE_ENV === 'production') return fail(res, 403, 'Sandbox disabled in production');
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payment: true } });
  if (!order || order.customerId !== req.user!.id) return fail(res, 404, 'Order not found');
  if (!order.payment) return fail(res, 400, 'No payment');
  if (order.payment.status === 'PAID') return ok(res, order.payment, 'Already paid (idempotent)');
  const status = succeed ? 'PAID' : 'FAILED';
  const updated = await prisma.$transaction(async (tx) => {
    const p = await tx.payment.update({ where: { id: order.payment!.id }, data: { status: status as never, paidAt: succeed ? new Date() : undefined } });
    if (succeed) {
      await tx.order.update({ where: { id: orderId }, data: { paymentStatus: 'PAID', orderStatus: 'PAID' } });
    } else {
      await tx.order.update({ where: { id: orderId }, data: { paymentStatus: 'FAILED' } });
    }
    return p;
  });
  return ok(res, { ...updated, sandbox: true }, succeed ? 'Payment verified (SANDBOX)' : 'Payment failed (SANDBOX)');
}

/** Webhook — validates HMAC, amount, order ref; idempotent. */
export async function webhook(req: Request, res: Response) {
  const raw = (req as unknown as { rawBody?: string }).rawBody ?? JSON.stringify(req.body);
  const sig = String(req.headers['x-signature'] ?? '');
  if (!verifyWebhookSignature(raw, sig)) return fail(res, 401, 'Invalid signature');
  const { providerRef, amount, status } = req.body as { providerRef: string; amount: number; status: string };
  const payment = await prisma.payment.findUnique({ where: { providerRef } });
  if (!payment) return fail(res, 404, 'Payment not found');
  if (payment.amount !== Number(amount)) return fail(res, 400, 'Amount mismatch');
  if (payment.status === 'PAID') return ok(res, payment, 'Already processed (idempotent)');
  if (status === 'PAID') {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({ where: { id: payment.id }, data: { status: 'PAID', paidAt: new Date() } });
      await tx.order.update({ where: { id: payment.orderId }, data: { paymentStatus: 'PAID', orderStatus: 'PAID' } });
    });
  } else if (status === 'FAILED' || status === 'EXPIRED') {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: status as never } });
    await prisma.order.update({ where: { id: payment.orderId }, data: { paymentStatus: status as never } });
  }
  const fresh = await prisma.payment.findUnique({ where: { id: payment.id } });
  return ok(res, fresh, 'Webhook processed');
}
