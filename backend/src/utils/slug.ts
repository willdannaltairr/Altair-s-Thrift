export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80) || 'item';
}

export function uniqueSlug(base: string): string {
  const clean = slugify(base);
  const rand = Math.random().toString(36).slice(2, 7);
  return `${clean}-${rand}`;
}

export function orderNumber(): string {
  const y = new Date().getFullYear();
  const r = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `AT-${y}-${r}`;
}
