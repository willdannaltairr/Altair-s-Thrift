import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { prisma } from '../config/db.js';
import { verifySession } from '../utils/jwt.js';

export interface AuthUser {
  id: string;
  email: string;
  roles: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[env.COOKIE_NAME];
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized', errors: null });
  try {
    const payload = verifySession(token);
    const dbUser = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!dbUser || dbUser.status !== 'ACTIVE') {
      return res.status(401).json({ success: false, message: 'Session revoked', errors: null });
    }
    req.user = { id: dbUser.id, email: dbUser.email, roles: payload.roles };
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid session', errors: null });
  }
}

export function requireRole(...allowed: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized', errors: null });
    const ok = req.user.roles.some((r) => allowed.includes(r));
    if (!ok) return res.status(403).json({ success: false, message: 'Forbidden', errors: null });
    next();
  };
}
