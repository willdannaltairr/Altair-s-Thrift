import { z } from 'zod';

export const addCartSchema = z.object({
  productId: z.string().uuid(),
  qty: z.number().int().min(1).max(99),
});

export const patchCartSchema = z.object({
  qty: z.number().int().min(1).max(99),
});

export const checkoutSchema = z.object({
  addressId: z.string().uuid(),
  courier: z.string().max(40).default('JNE'),
  notes: z.string().max(500).optional(),
});

export const addressSchema = z.object({
  label: z.string().max(40).optional(),
  recipient: z.string().min(2).max(120),
  phone: z.string().min(6).max(30),
  address: z.string().min(5).max(500),
  city: z.string().min(2).max(120),
  province: z.string().min(2).max(120),
  postalCode: z.string().min(3).max(20),
  isDefault: z.boolean().optional(),
});
