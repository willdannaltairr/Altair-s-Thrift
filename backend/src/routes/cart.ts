import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { addCartSchema, patchCartSchema } from '../validators/order.js';
import { getCart, addItem, patchItem, removeItem } from '../controllers/cart.js';

const r = Router();
r.use(requireAuth);
r.get('/', getCart);
r.post('/items', validate(addCartSchema), addItem);
r.patch('/items/:id', validate(patchCartSchema), patchItem);
r.delete('/items/:id', removeItem);
export default r;
