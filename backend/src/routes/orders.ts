import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { checkoutSchema } from '../validators/order.js';
import { checkout, myOrders, getOrder, updateOrderStatus } from '../controllers/orders.js';

const r = Router();
r.use(requireAuth);
r.get('/', myOrders);
r.get('/:id', getOrder);
r.post('/', validate(checkoutSchema), checkout);
r.patch('/:id/status', updateOrderStatus);
export default r;
