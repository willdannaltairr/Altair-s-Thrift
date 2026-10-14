import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import { notFound, errorHandler } from './middlewares/error.js';
import authRoutes from './routes/auth.js';
import storeRoutes from './routes/stores.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import sellerRoutes from './routes/seller.js';
import adminRoutes from './routes/admin.js';
import extraRoutes from './routes/extras.js';
import aiRoutes from './routes/ai.js';

export function buildApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
  app.use(cookieParser());
  app.use(morgan('dev'));
  // capture raw body for webhook HMAC while still parsing JSON
  app.use(
    express.json({
      limit: '1mb',
      verify: (req: unknown, _res, buf) => {
        (req as { rawBody?: string }).rawBody = buf.toString();
      },
    })
  );
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req, res) => res.json({ success: true, message: 'OK', data: { env: env.NODE_ENV } }));
  app.use('/api/auth', authRoutes);
  app.use('/api/stores', storeRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/seller', sellerRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api', extraRoutes);
  app.use('/api/ai', aiRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
