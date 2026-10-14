import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  fullName: z.string().min(2).max(120),
  phone: z.string().max(30).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  phone: z.string().max(30).optional().nullable(),
  avatarUrl: z.string().url().max(500).optional().nullable(),
});
