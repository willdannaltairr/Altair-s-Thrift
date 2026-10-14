import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { addressSchema } from '../validators/order.js';
import { listAddresses, createAddress, createReview, createReport } from '../controllers/extras.js';

const r = Router();
r.get('/addresses', requireAuth, listAddresses);
r.post('/addresses', requireAuth, validate(addressSchema), createAddress);
r.post('/reviews', requireAuth, createReview);
r.post('/reports', requireAuth, createReport);
export default r;
