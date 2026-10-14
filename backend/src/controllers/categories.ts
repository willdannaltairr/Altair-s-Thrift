import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { ok, created, fail } from '../utils/response.js';
import { slugify } from '../utils/slug.js';

export async function listCategories(_req: Request, res: Response) {
  const cats = await prisma.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  return ok(res, cats);
}

export async function createCategory(req: Request, res: Response) {
  const { name, description, imageUrl } = req.body as { name: string; description?: string; imageUrl?: string };
  const slug = slugify(name);
  const exists = await prisma.category.findFirst({ where: { OR: [{ name }, { slug }] } });
  if (exists) return fail(res, 409, 'Category exists');
  const cat = await prisma.category.create({ data: { name, slug, description, imageUrl } });
  return created(res, cat, 'Category created');
}

export async function patchCategory(req: Request, res: Response) {
  const { id } = req.params;
  const cat = await prisma.category.update({ where: { id }, data: req.body });
  return ok(res, cat, 'Category updated');
}
