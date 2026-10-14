import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { authLimiter } from '../middlewares/rateLimit.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/auth.js';
import { register, login, me, logout, updateMe } from '../controllers/auth.js';

const r = Router();
r.post('/register', authLimiter, validate(registerSchema), register);
r.post('/login', authLimiter, validate(loginSchema), login);
r.post('/logout', logout);
r.get('/me', requireAuth, me);
r.patch('/me', requireAuth, validate(updateProfileSchema), updateMe);
export default r;
