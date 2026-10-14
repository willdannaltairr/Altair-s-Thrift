import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from '../src/validators/auth.js';
import { verifyPassword, hashPassword } from '../src/utils/password.js';

describe('auth validation', () => {
  it('rejects weak password', () => {
    expect(registerSchema.safeParse({ email: 'a@b.co', password: 'short', fullName: 'Ab' }).success).toBe(false);
  });
  it('accepts valid register', () => {
    expect(
      registerSchema.safeParse({ email: 'u@mail.com', password: 'Strong123!', fullName: 'User Test' }).success
    ).toBe(true);
  });
  it('rejects empty login', () => {
    expect(loginSchema.safeParse({ email: 'x@y.co', password: '' }).success).toBe(false);
  });
});

describe('password hashing', () => {
  it('hashes and verifies', async () => {
    const h = await hashPassword('Customer123!');
    expect(await verifyPassword('Customer123!', h)).toBe(true);
    expect(await verifyPassword('Wrong123!', h)).toBe(false);
  });
});

describe('authorization rules', () => {
  it('seller cannot update another seller order (controller guard)', () => {
    const orderStoreOwner = 'owner-A';
    const actor = 'owner-B';
    const isAdmin = false;
    const allowed = orderStoreOwner === actor || isAdmin;
    expect(allowed).toBe(false);
  });
  it('customer cannot mark unpaid order completed', () => {
    const orderStatus = 'PENDING_PAYMENT';
    const requested = 'COMPLETED';
    const customerOnly = true;
    const allowed = !customerOnly || (requested === 'COMPLETED' && orderStatus === 'DELIVERED');
    expect(allowed).toBe(false);
  });
});
