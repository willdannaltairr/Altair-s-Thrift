import { Router } from 'express';
import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { paymentLimiter } from '../middlewares/rateLimit.js';
import { createPayment, simulatePay, webhook } from '../controllers/payments.js';

const r = Router();
r.post('/create', requireAuth, paymentLimiter, express.json(), createPayment);
r.post('/simulate', requireAuth, paymentLimiter, express.json(), simulatePay);
// Webhook needs raw body for HMAC — mounted with express.raw in app.ts; also accept JSON here for tests
r.post('/webhook', express.json({ verify: (req: unknown, _res, buf) => { (req as { rawBody?: string }).rawBody = buf.toString(); } }), webhook);
export default r;
