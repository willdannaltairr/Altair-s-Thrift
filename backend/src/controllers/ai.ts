import type { Request, Response } from 'express';
import { ok } from '../utils/response.js';
import { suggestProduct } from '../utils/ai.js';

/** POST /api/ai/suggest — server-side only. Returns null-safe fallback when no key. */
export async function suggest(req: Request, res: Response) {
  const { nameHint, brand, categoryHint, colorHint } = req.body as Record<string, string>;
  const ai = await suggestProduct({ nameHint: String(nameHint ?? ''), brand, categoryHint, colorHint });
  if (!ai) {
    return ok(res, {
      manual: true,
      message: 'AI key not configured — continue manually',
      needsConfirmation: ['material', 'defects', 'measurements', 'brand authenticity'],
    });
  }
  return ok(res, ai, 'AI suggestions (review required)');
}
