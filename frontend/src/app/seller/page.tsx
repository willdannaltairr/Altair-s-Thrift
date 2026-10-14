'use client';
import { useEffect, useState } from 'react';
import { Sidebar, sellerNav } from '@/components/Sidebar';
import { api } from '@/lib/api';
import { idr } from '@/types';

export default function SellerOverview() {
  const [d, setD] = useState<{ totalRevenue: number; totalOrders: number; productsSold: number; activeProducts: number; lowStock: Array<{ name: string }>; recentOrders: Array<{ id: string; orderNumber: string; total: number }> } | null>(null);
  useEffect(() => { api.get<typeof d>('/api/seller/dashboard').then(setD).catch(() => setD(null)); }, []);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 grid gap-4 md:grid-cols-[240px_1fr]">
      <Sidebar items={sellerNav} />
      <div className="space-y-3">
        <h1 className="font-display text-3xl">SELLER OVERVIEW</h1>
        {!d ? <p className="card p-6 text-sm">Create a store first, then stats appear from real orders.</p> : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="card p-4"><p className="text-xs text-muted">Revenue (PAID only)</p><p className="font-display text-xl">{idr(d.totalRevenue)}</p></div>
              <div className="card p-4"><p className="text-xs text-muted">Orders</p><p className="font-display text-xl">{d.totalOrders}</p></div>
              <div className="card p-4"><p className="text-xs text-muted">Sold</p><p className="font-display text-xl">{d.productsSold}</p></div>
              <div className="card p-4"><p className="text-xs text-muted">Active</p><p className="font-display text-xl">{d.activeProducts}</p></div>
            </div>
            <p className="text-sm">Low stock: {d.lowStock.map((x) => x.name).join(', ') || '-'}</p>
            <div>{d.recentOrders.map((o) => <p key={o.id} className="card p-3 text-sm mt-2">{o.orderNumber} • {idr(o.total)}</p>)}</div>
          </>
        )}
      </div>
    </div>
  );
}
