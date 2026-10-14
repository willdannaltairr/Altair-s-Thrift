import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { suggest } from '../controllers/ai.js';

const r = Router();
r.post('/suggest', requireAuth, suggest);
export default r;
