import type { NextFunction, Request, Response } from 'express';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error('[api-error]', err);
  const message = err instanceof Error ? err.message : 'Internal server error';
  const isProd = process.env.NODE_ENV === 'production';
  return res.status(500).json({
    success: false,
    message: isProd ? 'Internal server error' : message,
    errors: null,
  });
}

export function notFound(_req: Request, res: Response) {
  return res.status(404).json({ success: false, message: 'Not found', errors: null });
}
