import { z } from 'zod';

export const createStoreSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(2000).optional(),
  location: z.string().max(200).optional(),
  contact: z.string().max(200).optional(),
  socials: z.record(z.string().max(300)).optional(),
  category: z.string().max(80).optional(),
  theme: z.enum(['MINIMAL', 'STREETWEAR', 'CLASSIC']).optional(),
  logoUrl: z.string().url().max(500).optional(),
  bannerUrl: z.string().url().max(500).optional(),
});

export const updateStoreSchema = createStoreSchema.partial();

export const applyVerificationSchema = z.object({
  identityName: z.string().min(2).max(120),
  businessName: z.string().min(2).max(120),
  businessDesc: z.string().max(2000).optional(),
  contact: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  storeId: z.string().uuid().optional(),
});
