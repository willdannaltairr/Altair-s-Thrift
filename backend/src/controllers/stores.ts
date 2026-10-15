import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { ok, created, fail } from '../utils/response.js';
import { slugify } from '../utils/slug.js';

export async function listStores(_req: Request, res: Response) {
  const stores = await prisma.store.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, name: true, slug: true, logoUrl: true, bannerUrl: true, location: true, isVerified: true, _count: { select: { products: { where: { status: 'PUBLISHED' } } } } },
    orderBy: { createdAt: 'desc' },
    take: 24,
  });
  return ok(res, stores);
}

export async function getStore(req: Request, res: Response) {
  const { slug } = req.params;
  const store = await prisma.store.findUnique({
    where: { slug },
    include: {
      products: { where: { status: 'PUBLISHED' }, include: { images: { orderBy: { position: 'asc' }, take: 1 } }, take: 24, orderBy: { createdAt: 'desc' } },
      reviews: { take: 10, orderBy: { createdAt: 'desc' }, include: { customer: { select: { fullName: true } } } },
    },
  });
  if (!store || store.status !== 'ACTIVE') return fail(res, 404, 'Store not found');
  return ok(res, store);
}

export async function createStore(req: Request, res: Response) {
  const userId = req.user!.id;
  const { name, slug, description, location, contact, socials, category, theme, logoUrl, bannerUrl } = req.body as Record<string, never>;
  const finalSlug = slug ? slugify(String(slug)) : slugify(String(name));
  const exists = await prisma.store.findUnique({ where: { slug: finalSlug } });
  if (exists) return fail(res, 409, 'Store slug already taken');
  const store = await prisma.$transaction(async (tx) => {
    const s = await tx.store.create({
      data: {
        ownerId: userId, name: String(name), slug: finalSlug,
        description: description as string | undefined,
        location: location as string | undefined,
        contact: contact as string | undefined,
        socials: socials ? JSON.stringify(socials) : undefined,
        category: category as string | undefined,
        theme: (theme as 'MINIMAL' | 'STREETWEAR' | 'CLASSIC' | undefined) ?? 'MINIMAL',
        logoUrl: logoUrl as string | undefined,
        bannerUrl: bannerUrl as string | undefined,
      },
    });
    const seller = await tx.role.upsert({ where: { name: 'SELLER' }, update: {}, create: { name: 'SELLER' } });
    await tx.userRole.upsert({ where: { userId_roleId: { userId, roleId: seller.id } }, update: {}, create: { userId, roleId: seller.id } });
    return s;
  });
  return created(res, store, 'Store created successfully');
}

export async function patchStore(req: Request, res: Response) {
  const { id } = req.params;
  const store = await prisma.store.findUnique({ where: { id } });
  if (!store) return fail(res, 404, 'Store not found');
  const isOwner = store.ownerId === req.user!.id;
  const isAdmin = req.user!.roles.includes('ADMIN');
  if (!isOwner && !isAdmin) return fail(res, 403, 'Forbidden');
  const body = req.body as Record<string, unknown>;
  // SQLite stores socials as JSON string
  if (body.socials && typeof body.socials === 'object') body.socials = JSON.stringify(body.socials);
  const updated = await prisma.store.update({ where: { id }, data: body as never });
  return ok(res, updated, 'Store updated');
}

export async function myStores(req: Request, res: Response) {
  const stores = await prisma.store.findMany({ where: { ownerId: req.user!.id }, orderBy: { createdAt: 'desc' } });
  return ok(res, stores);
}
