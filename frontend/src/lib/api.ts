const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    cache: 'no-store',
  });
  const json = (await res.json().catch(() => null)) as { success: boolean; message: string; data: T } | null;
  if (!res.ok || !json?.success) throw new Error(json?.message ?? `Request failed ${res.status}`);
  return json.data;
}

export const api = {
  get: <T>(p: string) => req<T>(p),
  post: <T>(p: string, body?: unknown) => req<T>(p, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  patch: <T>(p: string, body?: unknown) => req<T>(p, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
  del: <T>(p: string) => req<T>(p, { method: 'DELETE' }),
};
