'use client';
import { useEffect, useState } from 'react';
import { Sidebar, sellerNav } from '@/components/Sidebar';
import { api } from '@/lib/api';
import { idr } from '@/types';

export default function SellerOrders() {
  const [rows, setRows] = useState<Array<{ id: string; orderNumber: string; total: number; orderStatus: string; paymentStatus: string }>>([]);
  const load = () => api.get<typeof rows>('/api/seller/orders').then(setRows).catch(() => setRows([]));
  useEffect(() => { void load(); }, []);
  const act = (id: string, status: string) => api.patch(`/api/orders/${id}/status`, { status }).then(load).catch(() => alert('Invalid transition or unpaid'));
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 grid gap-4 md:grid-cols-[240px_1fr]">
      <Sidebar items={sellerNav} />
      <div className="space-y-3">
        <h1 className="font-display text-3xl">ORDERS</h1>
        {rows.length === 0 ? <p className="card p-6 text-sm">You haven&apos;t received any orders yet.</p> : null}
        {rows.map((o) => (
          <div key={o.id} className="card p-3 text-sm flex flex-wrap gap-2 items-center">
            <span className="flex-1">{o.orderNumber} • {idr(o.total)} • {o.orderStatus}/{o.paymentStatus}</span>
            <button className="btn-ghost !py-1" onClick={() => act(o.id, 'PROCESSING')}>Process</button>
            <button className="btn-ghost !py-1" onClick={() => act(o.id, 'SHIPPED')}>Ship</button>
          </div>
        ))}
      </div>
    </div>
  );
}
