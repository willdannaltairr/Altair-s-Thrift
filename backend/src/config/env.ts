import dotenv from 'dotenv';
dotenv.config();

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 4000),
  DATABASE_URL: required('DATABASE_URL'),
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  COOKIE_NAME: process.env.COOKIE_NAME ?? 'altair_session',
  FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  BACKEND_URL: process.env.BACKEND_URL ?? 'http://localhost:4000',
  PAYMENT_WEBHOOK_SECRET: process.env.PAYMENT_WEBHOOK_SECRET ?? 'local-payment-webhook-secret',
  AI_API_KEY: process.env.AI_API_KEY ?? '',
  AI_MODEL: process.env.AI_MODEL ?? 'gpt-4o-mini',
};

export const isProd = env.NODE_ENV === 'production';
