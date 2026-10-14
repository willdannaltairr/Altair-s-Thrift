'use client';
import { useEffect, useState } from 'react';
import { Sidebar, sellerNav } from '@/components/Sidebar';
import { api } from '@/lib/api';
import { idr } from '@/types';

export default function SellerProducts() {
  const [rows, setRows] = useState<Array<{ id: string; name: string; price: number; stock: number; status: string }>>([]);
  useEffect(() => { api.get<typeof rows>('/api/products/seller/mine').then(setRows).catch(() => setRows([])); }, []);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 grid gap-4 md:grid-cols-[240px_1fr]">
      <Sidebar items={sellerNav} />
      <div className="space-y-3">
        <h1 className="font-display text-3xl">PRODUCTS</h1>
        {rows.length === 0 ? <p className="card p-6 text-sm">No products yet. Create your first listing.</p> : null}
        {rows.map((p) => <div key={p.id} className="card p-3 text-sm flex justify-between"><span>{p.name} • {idr(p.price)} • {p.stock}</span><span>{p.status}</span></div>)}
      </div>
    </div>
  );
}
