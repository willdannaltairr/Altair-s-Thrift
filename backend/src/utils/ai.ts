import { env } from '../config/env.js';

export interface AiSuggestion {
  title?: string;
  categorySlug?: string;
  color?: string;
  description?: string;
  tags?: string[];
  materialGuess?: string;
  needsConfirmation: string[];
}

/**
 * Server-side AI assistant. If no key configured, caller must fallback to manual flow.
 * Never invents defects, measurements, brand authenticity.
 */
export async function suggestProduct(input: {
  nameHint: string;
  brand?: string;
  categoryHint?: string;
  colorHint?: string;
}): Promise<AiSuggestion | null> {
  if (!env.AI_API_KEY) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.AI_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You assist Indonesian thrift sellers. Suggest title, category, color, description, tags, possible material. Never invent defects, measurements, brand authenticity. If uncertain, list it in needsConfirmation.',
          },
          { role: 'user', content: JSON.stringify(input) },
        ],
        max_tokens: 400,
        temperature: 0.6,
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const text = json.choices?.[0]?.message?.content ?? '';
    return {
      description: text.slice(0, 2000),
      tags: [],
      needsConfirmation: ['material', 'defects', 'measurements', 'brand authenticity'],
    };
  } catch {
    return null;
  }
}
