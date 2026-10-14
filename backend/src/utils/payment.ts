import crypto from 'node:crypto';
import { env } from '../config/env.js';

/** HMAC verification for payment webhooks. Never trust frontend status. */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const expected = crypto.createHmac('sha256', env.PAYMENT_WEBHOOK_SECRET).update(rawBody).digest('hex');
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}
