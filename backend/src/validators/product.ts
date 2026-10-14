import { z } from 'zod';

const productBase = z.object({
  name: z.string().min(2).max(200),
  brand: z.string().max(120).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  price: z.number().int().min(0).max(1_000_000_000),
  categoryId: z.string().uuid().optional().nullable(),
  size: z.string().max(20).optional().nullable(),
  chestMeasurement: z.string().max(40).optional().nullable(),
  lengthMeasurement: z.string().max(40).optional().nullable(),
  material: z.string().max(120).optional().nullable(),
  color: z.string().max(80).optional().nullable(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR']).optional(),
  defects: z.string().max(2000).optional().nullable(),
  stock: z.number().int().min(0).max(100000).optional(),
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'ARCHIVED']).optional(),
  tags: z.array(z.string().max(40)).max(10).optional(),
  images: z.array(z.object({ url: z.string().url().max(1000), alt: z.string().max(200).optional() })).max(8).optional(),
});

export const createProductSchema = productBase;
export const updateProductSchema = productBase.partial();

export const productQuerySchema = z.object({
  q: z.string().max(120).optional(),
  category: z.string().max(80).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  size: z.string().max(20).optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR']).optional(),
  brand: z.string().max(120).optional(),
  location: z.string().max(200).optional(),
  inStock: z.coerce.boolean().optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});
