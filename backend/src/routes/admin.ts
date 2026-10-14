import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { overview, listUsers, patchUser, listVerifications, verifySeller, pendingProducts, moderateProduct, adminOrders, listReports, resolveReport } from '../controllers/admin.js';

const r = Router();
r.use(requireAuth, requireRole('ADMIN'));
r.get('/dashboard', overview);
r.get('/users', listUsers);
r.patch('/users/:id', patchUser);
r.get('/sellers', listVerifications);
r.patch('/sellers/:id/verify', verifySeller);
r.get('/products/pending', pendingProducts);
r.patch('/products/:id/moderate', moderateProduct);
r.get('/orders', adminOrders);
r.get('/reports', listReports);
r.patch('/reports/:id', resolveReport);
export default r;
