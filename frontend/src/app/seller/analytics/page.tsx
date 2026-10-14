'use client';
import { useEffect, useState } from 'react';
import { Sidebar, sellerNav } from '@/components/Sidebar';
import { api } from '@/lib/api';
import { idr } from '@/types';

export default function AnalyticsPage() {
  const [a, setA] = useState<{ revenue: number; totalOrders: number; unitsSold: number; aov: number; trend: Array<{ date: string; revenue: number }>; bestSellers: Array<{ name: string; qty: number; revenue: number }> } | null>(null);
  useEffect(() => { api.get<typeof a>('/api/seller/analytics').then(setA).catch(() => setA(null)); }, []);
  if (!a) return <div className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-[240px_1fr] gap-4"><Sidebar items={sellerNav} /><p className="card p-6 text-sm">No analytics yet — paid orders will appear here.</p></div>;
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 grid gap-4 md:grid-cols-[240px_1fr]">
      <Sidebar items={sellerNav} />
      <div className="space-y-3">
        <h1 className="font-display text-3xl">ANALYTICS</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card p-4"><p className="text-xs">Revenue (PAID)</p><p className="font-display">{idr(a.revenue)}</p></div>
          <div className="card p-4"><p className="text-xs">Orders</p><p className="font-display">{a.totalOrders}</p></div>
          <div className="card p-4"><p className="text-xs">Units</p><p className="font-display">{a.unitsSold}</p></div>
          <div className="card p-4"><p className="text-xs">AOV</p><p className="font-display">{idr(a.aov)}</p></div>
        </div>
        <div className="card p-4 text-sm">Trend: {a.trend.map((t) => `${t.date} ${idr(t.revenue)}`).join(' • ') || '-'}</div>
        <div>{a.bestSellers.map((b) => <p key={b.name} className="card p-3 text-sm mt-2">{b.name} • {b.qty} sold • {idr(b.revenue)}</p>)}</div>
      </div>
    </div>
  );
}
