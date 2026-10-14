import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { applyVerificationSchema } from '../validators/store.js';
import { dashboard, analytics, sellerOrders, inventory, updateInventory, applyVerification } from '../controllers/seller.js';

const r = Router();
r.use(requireAuth);
r.get('/dashboard', dashboard);
r.get('/analytics', analytics);
r.get('/orders', sellerOrders);
r.get('/inventory', inventory);
r.patch('/inventory/:id', updateInventory);
r.post('/verify', validate(applyVerificationSchema), applyVerification);
export default r;
