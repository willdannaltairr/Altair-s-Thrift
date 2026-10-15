'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { Skeleton, EmptyState } from '@/components/Feedback';
import { api } from '@/lib/api';
import type { Product } from '@/types';
import Link from 'next/link';

function useDebounced(v: string, ms = 400) {
  const [v2, setV2] = useState(v);
  useEffect(() => { const t = setTimeout(() => setV2(v), ms); return () => clearTimeout(t); }, [v, ms]);
  return v2;
}

export default function ShopPage() {
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get('q') ?? '');
  const [category, setCategory] = useState(sp.get('category') ?? '');
  const [sort, setSort] = useState('newest');
  const [condition, setCondition] = useState('');
  const [page, setPage] = useState(1);
  const dq = useDebounced(q);
  const [data, setData] = useState<{ items: Product[]; total: number; pages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true); setError('');
    const params = new URLSearchParams({ page: String(page), limit: '12', sort });
    if (dq) params.set('q', dq);
    if (category) params.set('category', category);
    if (condition) params.set('condition', condition);
    api.get<{ items: Product[]; total: number; pages: number }>(`/api/products?${params}`)
      .then(setData).catch((e: Error) => setError(e.message)).finally(() => setLoading(false));
  }, [dq, category, sort, condition, page]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl">SHOP</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search name, brand, store..." className="input max-w-xs" />
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="input max-w-[180px]">
          <option value="">All categories</option>
          {['t-shirts','shirts','jackets','hoodies','pants','denim','footwear','accessories'].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={condition} onChange={(e) => { setCondition(e.target.value); setPage(1); }} className="input max-w-[160px]">
          <option value="">Any condition</option><option value="NEW">New</option><option value="LIKE_NEW">Like new</option><option value="GOOD">Good</option><option value="FAIR">Fair</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input max-w-[180px]">
          <option value="newest">Newest</option><option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option>
        </select>
      </div>
      {loading ? <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72" />)}</div>
      : error ? <div className="mt-6"><EmptyState title="Failed to load products" hint={error} /></div>
      : !data || data.items.length === 0 ? <div className="mt-6"><EmptyState title="No products found. Try adjusting your filters." action={<Link href="/shop" className="btn-ghost">Reset</Link>} /></div>
      : <>
        <p className="text-xs text-muted mt-4">{data.total} products</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">{data.items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        <div className="flex gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => setPage((x) => x - 1)} className="btn-ghost !py-2">Prev</button>
          <span className="text-sm self-center">Page {page} / {Math.max(1, data.pages)}</span>
          <button disabled={page >= data.pages} onClick={() => setPage((x) => x + 1)} className="btn-ghost !py-2">Next</button>
        </div>
      </>}
    </div>
  );
}
