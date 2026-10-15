import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { ok, created, fail } from '../utils/response.js';
import { slugify } from '../utils/slug.js';

export async function listProducts(req: Request, res: Response) {
  const { q, category, minPrice, maxPrice, size, condition, brand, location, inStock, sort, page = 1, limit = 12 } = req.query as Record<string, string>;
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(48, Math.max(1, Number(limit) || 12));
  const where: Record<string, unknown> = { status: 'PUBLISHED' };
  // NOTE: SQLite does not support `mode: 'insensitive'`. Keep plain `contains`
  // (case-sensitive on SQLite). When migrating to PostgreSQL, re-add mode.
  if (q) {
    (where as Record<string, unknown>).OR = [
      { name: { contains: String(q) } },
      { brand: { contains: String(q) } },
      { store: { name: { contains: String(q) } } },
    ];
  }
  if (category) where.category = { slug: String(category) };
  // Prisma Category relation is `category`, but filter above uses relation; fix:
  if (category) {
    delete (where as Record<string, unknown>).category;
    (where as Record<string, unknown>).category = { slug: String(category) };
  }
  if (minPrice || maxPrice) {
    (where as Record<string, unknown>).price = {
      ...(minPrice ? { gte: Number(minPrice) } : {}),
      ...(maxPrice ? { lte: Number(maxPrice) } : {}),
    };
  }
  if (size) where.size = String(size);
  if (condition) where.condition = String(condition);
  if (brand) where.brand = { contains: String(brand) };
  if (location) where.store = { ...(where.store as object ?? {}), location: { contains: String(location) } };
  if (String(inStock) === 'true') where.stock = { gt: 0 };

  const orderBy =
    sort === 'price_asc' ? { price: 'asc' as const } :
    sort === 'price_desc' ? { price: 'desc' as const } :
    { createdAt: 'desc' as const };

  const [total, items] = await Promise.all([
    prisma.product.count({ where: where as never }),
    prisma.product.findMany({
      where: where as never,
      include: {
        images: { orderBy: { position: 'asc' }, take: 1 },
        store: { select: { name: true, slug: true, location: true, isVerified: true } },
        category: { select: { name: true, slug: true } },
      },
      orderBy,
      skip: (p - 1) * l,
      take: l,
    }),
  ]);
  return ok(res, { items, total, page: p, limit: l, pages: Math.ceil(total / l) });
}

export async function getProduct(req: Request, res: Response) {
  const { slug } = req.params;
  const product = await prisma.product.findFirst({
    where: { slug },
    include: {
      images: { orderBy: { position: 'asc' } },
      store: true,
      category: true,
      reviews: { include: { customer: { select: { fullName: true } } }, orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });
  if (!product) return fail(res, 404, 'Product not found');
  const related = await prisma.product.findMany({
    where: { status: 'PUBLISHED', categoryId: product.categoryId ?? undefined, id: { not: product.id } },
    include: { images: { take: 1 } },
    take: 8,
  });
  return ok(res, { ...product, related });
}

import type { Product, Store } from '@prisma/client';

type ProductWithStore = Product & { store: Store };

async function assertOwnership(
  res: Response,
  userId: string,
  roles: string[],
  productId: string
): Promise<ProductWithStore | null> {
  const product = await prisma.product.findUnique({ where: { id: productId }, include: { store: true } });
  if (!product) {
    fail(res, 404, 'Product not found');
    return null;
  }
  if (product.store.ownerId !== userId && !roles.includes('ADMIN')) {
    fail(res, 403, 'Forbidden');
    return null;
  }
  return product;
}

export async function createProduct(req: Request, res: Response) {
  const userId = req.user!.id;
  const { storeId } = req.body as { storeId?: string };
  // Resolve store: explicit storeId or first owned store
  let store = storeId
    ? await prisma.store.findUnique({ where: { id: storeId } })
    : await prisma.store.findFirst({ where: { ownerId: userId } });
  if (!store) return fail(res, 400, 'Create a store first');
  if (store.ownerId !== userId && !req.user!.roles.includes('ADMIN')) return fail(res, 403, 'Forbidden');
  const base = slugify(String(req.body.name));
  const slug = `${base}`.slice(0, 70);
  // ensure unique within store
  const clash = await prisma.product.findUnique({ where: { storeId_slug: { storeId: store.id, slug } } });
  const finalSlug = clash ? `${slug}-${Math.random().toString(36).slice(2, 6)}` : slug;
  const { images, ...rest } = req.body as Record<string, unknown>;
  const str = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined);
  const stock = Number((rest.stock as number | string | undefined) ?? 0);
  if (stock < 0) return fail(res, 400, 'Stock cannot be negative');
  const createdProduct = await prisma.$transaction(async (tx) => {
    const p = await tx.product.create({
      data: {
        storeId: store!.id,
        name: String(rest.name),
        slug: finalSlug,
        brand: str(rest.brand),
        description: str(rest.description),
        price: Number(rest.price),
        categoryId: str(rest.categoryId),
        size: str(rest.size),
        chestMeasurement: str(rest.chestMeasurement),
        lengthMeasurement: str(rest.lengthMeasurement),
        material: str(rest.material),
        color: str(rest.color),
        condition: str(rest.condition) ?? 'GOOD',
        defects: str(rest.defects),
        stock,
        status: str(rest.status) ?? 'DRAFT',
        // SQLite: tags stored as JSON string (see schema). PG migration: back to array.
        tags: JSON.stringify(Array.isArray(rest.tags) ? rest.tags : []),
      },
    });
    await tx.inventory.create({ data: { productId: p.id, available: stock, reserved: 0, sold: 0 } });
    await tx.inventoryMovement.create({ data: { productId: p.id, type: 'IN', qty: stock, note: 'initial' } });
    if (Array.isArray(images)) {
      for (let i = 0; i < (images as Array<{ url: string; alt?: string }>).length; i++) {
        const im = (images as Array<{ url: string; alt?: string }>)[i];
        await tx.productImage.create({ data: { productId: p.id, url: im.url, alt: im.alt, position: i } });
      }
    }
    return p;
  });
  return created(res, createdProduct, 'Product created successfully');
}

export async function updateProduct(req: Request, res: Response) {
  const { id } = req.params;
  const owned = await assertOwnership(res, req.user!.id, req.user!.roles, id);
  if (!owned) return;
  const { images, stock, ...rest } = req.body as Record<string, unknown>;
  const data: Record<string, unknown> = { ...rest };
  if (Array.isArray(rest.tags)) {
    data.tags = JSON.stringify(rest.tags);
  }
  if (stock !== undefined) {
    const s = Number(stock);
    if (s < 0) return fail(res, 400, 'Stock cannot be negative');
    data.stock = s;
  }
  const updated = await prisma.$transaction(async (tx) => {
    const prev = await tx.product.findUnique({ where: { id } });
    const p = await tx.product.update({ where: { id }, data: data as never });
    if (stock !== undefined && prev && Number(stock) !== prev.stock) {
      const diff = Number(stock) - prev.stock;
      await tx.inventory.upsert({
        where: { productId: id },
        update: { available: Number(stock) },
        create: { productId: id, available: Number(stock) },
      });
      await tx.inventoryMovement.create({ data: { productId: id, type: 'ADJUST', qty: diff, note: `manual adjust to ${stock}` } });
    }
    if (Array.isArray(images)) {
      await tx.productImage.deleteMany({ where: { productId: id } });
      for (let i = 0; i < (images as Array<{ url: string; alt?: string }>).length; i++) {
        const im = (images as Array<{ url: string; alt?: string }>)[i];
        await tx.productImage.create({ data: { productId: id, url: im.url, alt: im.alt, position: i } });
      }
    }
    return p;
  });
  return ok(res, updated, 'Product updated');
}

export async function archiveProduct(req: Request, res: Response) {
  const { id } = req.params;
  const owned = await assertOwnership(res, req.user!.id, req.user!.roles, id);
  if (!owned) return;
  const p = await prisma.product.update({ where: { id }, data: { status: 'ARCHIVED' } });
  return ok(res, p, 'Product archived');
}

export async function sellerProducts(req: Request, res: Response) {
  const stores = await prisma.store.findMany({ where: { ownerId: req.user!.id }, select: { id: true } });
  const ids = stores.map((s) => s.id);
  const items = await prisma.product.findMany({
    where: { storeId: { in: ids } },
    include: { images: { take: 1 }, inventory: true, category: true },
    orderBy: { updatedAt: 'desc' },
    take: 200,
  });
  return ok(res, items);
}
