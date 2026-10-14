import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signSession } from '../utils/jwt.js';
import { ok, created, fail } from '../utils/response.js';
import { isProd } from '../config/env.js';

function cookieOpts() {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 3600 * 1000,
    path: '/',
  };
}

async function rolesFor(userId: string): Promise<string[]> {
  const rows = await prisma.userRole.findMany({
    where: { userId },
    include: { role: true },
  });
  return rows.map((r) => r.role.name);
}

export async function register(req: Request, res: Response) {
  const { email, password, fullName, phone } = req.body as {
    email: string; password: string; fullName: string; phone?: string;
  };
  const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (exists) return fail(res, 409, 'Email already registered');
  const passwordHash = await hashPassword(password);
  const user = await prisma.$transaction(async (tx) => {
    const u = await tx.user.create({
      data: { email: email.toLowerCase(), passwordHash, fullName, phone },
    });
    const customer = await tx.role.upsert({ where: { name: 'CUSTOMER' }, update: {}, create: { name: 'CUSTOMER' } });
    await tx.userRole.create({ data: { userId: u.id, roleId: customer.id } });
    await tx.cart.create({ data: { userId: u.id } });
    return u;
  });
  const roles = await rolesFor(user.id);
  const token = signSession({ sub: user.id, email: user.email, roles });
  res.cookie(env.COOKIE_NAME, token, cookieOpts());
  return created(res, { id: user.id, email: user.email, fullName: user.fullName, roles }, 'Registered');
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email: string; password: string };
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return fail(res, 401, 'Invalid credentials');
  if (user.status !== 'ACTIVE') return fail(res, 403, 'Account suspended');
  const okPass = await verifyPassword(password, user.passwordHash);
  if (!okPass) return fail(res, 401, 'Invalid credentials');
  const roles = await rolesFor(user.id);
  const token = signSession({ sub: user.id, email: user.email, roles });
  res.cookie(env.COOKIE_NAME, token, cookieOpts());
  return ok(res, { id: user.id, email: user.email, fullName: user.fullName, roles }, 'Logged in');
}

export async function me(req: Request, res: Response) {
  if (!req.user) return fail(res, 401, 'Unauthorized');
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, fullName: true, phone: true, avatarUrl: true, status: true, createdAt: true },
  });
  if (!user) return fail(res, 401, 'Unauthorized');
  return ok(res, { ...user, roles: req.user.roles });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie(env.COOKIE_NAME, { path: '/' });
  return ok(res, null, 'Logged out');
}

export async function updateMe(req: Request, res: Response) {
  if (!req.user) return fail(res, 401, 'Unauthorized');
  const { fullName, phone, avatarUrl } = req.body as Record<string, string | null>;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { fullName: fullName ?? undefined, phone: phone ?? undefined, avatarUrl: avatarUrl ?? undefined },
    select: { id: true, email: true, fullName: true, phone: true, avatarUrl: true },
  });
  return ok(res, user, 'Profile updated');
}
