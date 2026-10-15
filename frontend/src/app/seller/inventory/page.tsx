'use client';
import { useEffect, useState } from 'react';
import { Sidebar, sellerNav } from '@/components/Sidebar';
import { api } from '@/lib/api';

export default function InventoryPage() {
  const [rows, setRows] = useState<Array<{ id: string; name: string; stock: number; available: number; reserved: number; sold: number; status: string }>>([]);
  const load = () => api.get<typeof rows>('/api/seller/inventory').then(setRows).catch(() => setRows([]));
  useEffect(() => { void load(); }, []);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 grid gap-4 md:grid-cols-[240px_1fr]">
      <Sidebar items={sellerNav} />
      <div className="space-y-3">
        <h1 className="font-display text-3xl">INVENTORY</h1>
        {rows.map((r) => (
          <div key={r.id} className="card p-3 text-sm flex items-center gap-3">
            <span className="flex-1">{r.name} • avail {r.available} • reserved {r.reserved} • sold {r.sold} • {r.status}</span>
            <button className="btn-ghost !py-1" onClick={() => void api.patch(`/api/seller/inventory/${r.id}`, { stock: r.stock + 1 }).then(load)}>+1</button>
          </div>
        ))}
        {rows.length === 0 ? <p className="card p-6 text-sm">No inventory yet.</p> : null}
      </div>
    </div>
  );
}
