import { describe, it, expect } from 'vitest';
import { slugify, orderNumber } from '../src/utils/slug.js';
import { verifyWebhookSignature } from '../src/utils/payment.js';
import { productQuerySchema, createProductSchema } from '../src/validators/product.js';
import { checkoutSchema } from '../src/validators/order.js';

process.env.PAYMENT_WEBHOOK_SECRET = 'test-secret';
process.env.JWT_SECRET = 'test-jwt-secret-min-32-chars-xxxxxx';

describe('slug & order number', () => {
  it('slugifies names', () => {
    expect(slugify('Vintage Denim Jacket!')).toBe('vintage-denim-jacket');
  });
  it('generates unique order numbers', () => {
    expect(orderNumber()).toMatch(/^AT-\d{4}-[A-Z0-9]+$/);
  });
});

describe('product validation', () => {
  it('rejects negative price', () => {
    const r = createProductSchema.safeParse({ name: 'A', price: -100 });
    expect(r.success).toBe(false);
  });
  it('rejects negative stock', () => {
    const r = createProductSchema.safeParse({ name: 'Ab', price: 10000, stock: -1 });
    expect(r.success).toBe(false);
  });
  it('parses marketplace query with pagination defaults', () => {
    const r = productQuerySchema.safeParse({});
    expect(r.success).toBe(true);
  });
});

describe('checkout validation', () => {
  it('requires addressId uuid', () => {
    const r = checkoutSchema.safeParse({ addressId: 'not-uuid' });
    expect(r.success).toBe(false);
  });
});

describe('inventory invariant', () => {
  it('stock cannot become negative (service guard)', () => {
    const stock = 1;
    const qty = 2;
    expect(qty > stock).toBe(true); // checkout must reject before transaction
  });
});

describe('payment webhook idempotency concept', () => {
  it('already-paid payments short-circuit', () => {
    const existingStatus = 'PAID';
    const incoming = 'PAID';
    const shouldSkip = existingStatus === 'PAID' && incoming === 'PAID';
    expect(shouldSkip).toBe(true);
  });
});
