export interface Product {
  id: string;
  name: string;
  slug: string;
  brand?: string | null;
  price: number;
  size?: string | null;
  condition: string;
  stock: number;
  status: string;
  images: Array<{ url: string; alt?: string | null }>;
  store?: { name: string; slug: string; location?: string | null; isVerified?: boolean };
  category?: { name: string; slug: string } | null;
  description?: string | null;
  defects?: string | null;
  material?: string | null;
  color?: string | null;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  description?: string | null;
  location?: string | null;
  isVerified?: boolean;
  theme?: string;
}

export function idr(n: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}
