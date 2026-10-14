import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface SessionPayload {
  sub: string;
  email: string;
  roles: string[];
}

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifySession(token: string): SessionPayload {
  return jwt.verify(token, env.JWT_SECRET) as SessionPayload;
}
