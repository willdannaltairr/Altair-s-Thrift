import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import StoreCard from '@/components/StoreCard';
import { api } from '@/lib/api';
import type { Product } from '@/types';

export const metadata: Metadata = {
  title: "Altair's Thrift — Redefine Your Style",
  description: 'Discover curated fashion from local UMKM across Indonesia.',
};

const CATS = [
  { name: 'T-Shirts', slug: 't-shirts' },
  { name: 'Shirts', slug: 'shirts' },
  { name: 'Jackets', slug: 'jackets' },
  { name: 'Hoodies', slug: 'hoodies' },
  { name: 'Pants', slug: 'pants' },
  { name: 'Denim', slug: 'denim' },
  { name: 'Footwear', slug: 'footwear' },
  { name: 'Accessories', slug: 'accessories' },
];

async function getTrending(): Promise<Product[]> {
  try {
    const d = await api.get<{ items: Product[] }>(`/api/products?limit=8&sort=newest`);
    return d.items;
  } catch {
    return [];
  }
}

async function getStores() {
  try {
    return await api.get<Array<{ name: string; slug: string; logoUrl?: string | null; bannerUrl?: string | null; location?: string | null; isVerified?: boolean }>>('/api/stores');
  } catch {
    return [];
  }
}

export default async function Home() {
  const [trending, stores] = await Promise.all([getTrending(), getStores()]);
  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 pt-10 grid gap-8 md:grid-cols-2 items-center">
        <div className="space-y-5">
          <p className="badge">UMKM Marketplace • Indonesia</p>
          <h1 className="font-display text-5xl md:text-7xl leading-[0.95]">REDEFINE<br />YOUR STYLE.</h1>
          <p className="text-muted max-w-md">Discover curated fashion from local businesses and independent sellers across Indonesia.</p>
          <div className="flex gap-3">
            <Link href="/shop" className="btn-primary inline-flex items-center gap-2">Explore Collection <ArrowRight size={16} /></Link>
            <Link href="/seller" className="btn-ghost">Start Selling</Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://picsum.photos/seed/altair-hero-1/600/800" alt="Editorial fashion" className="rounded-2xl object-cover h-72 w-full" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://picsum.photos/seed/altair-hero-2/600/800" alt="Thrift curation" className="rounded-2xl object-cover h-72 w-full mt-6" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 mt-14">
        <h2 className="font-display text-2xl mb-4">FEATURED CATEGORIES</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATS.map((c) => (
            <Link key={c.slug} href={`/shop?category=${c.slug}`} className="card p-5 hover:border-ink transition">
              <p className="font-semibold">{c.name}</p>
              <p className="text-xs text-muted">Shop now →</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 mt-14">
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-display text-2xl">TRENDING NOW</h2>
          <Link href="/shop" className="text-sm text-accent font-semibold">View all</Link>
        </div>
        {trending.length === 0 ? (
          <p className="text-sm text-muted card p-6">No products found. Try adjusting your filters — or seed the database.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {trending.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 mt-14">
        <h2 className="font-display text-2xl mb-4">FEATURED STORES</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {stores.slice(0, 6).map((s) => <StoreCard key={s.slug} s={s} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 mt-14 grid md:grid-cols-3 gap-3">
        {[
          { t: 'For Buyers', d: 'Discover fashion from multiple local sellers.' },
          { t: 'For Sellers', d: 'Manage your digital store and sales in one place.' },
          { t: 'For Local Business', d: 'Reach customers through an integrated marketplace.' },
        ].map((x) => (
          <div key={x.t} className="card p-6"><p className="font-display text-xl">{x.t.toUpperCase()}</p><p className="text-sm text-muted mt-1">{x.d}</p></div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 mt-14">
        <div className="bg-charcoal text-white rounded-3xl p-10 text-center space-y-4">
          <h2 className="font-display text-3xl md:text-5xl">YOUR BRAND DESERVES A DIGITAL STOREFRONT.</h2>
          <Link href="/seller" className="btn-primary inline-block !bg-white !text-ink">Open Your Store</Link>
        </div>
      </section>
    </div>
  );
}
