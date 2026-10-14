import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { listCategories, createCategory, patchCategory } from '../controllers/categories.js';

const r = Router();
r.get('/', listCategories);
r.post('/', requireAuth, requireRole('ADMIN'), createCategory);
r.patch('/:id', requireAuth, requireRole('ADMIN'), patchCategory);
export default r;
