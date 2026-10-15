'use client';
import { useEffect, useState } from 'react';
import { Sidebar, accountNav } from '@/components/Sidebar';
import { api } from '@/lib/api';
import { idr } from '@/types';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Array<{ id: string; orderNumber: string; total: number; orderStatus: string; paymentStatus: string; store: { name: string } }>>([]);
  useEffect(() => { api.get<typeof orders>('/api/orders').then(setOrders).catch(() => setOrders([])); }, []);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 grid gap-4 md:grid-cols-[220px_1fr]">
      <Sidebar items={accountNav} />
      <div className="space-y-3">
        <h1 className="font-display text-3xl">ORDERS</h1>
        {orders.length === 0 ? <p className="text-sm card p-6">No orders yet.</p> : orders.map((o) => (
          <div key={o.id} className="card p-4 text-sm flex justify-between">
            <span>{o.orderNumber} • {o.store.name} • {idr(o.total)}</span>
            <span>{o.orderStatus} / {o.paymentStatus}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
