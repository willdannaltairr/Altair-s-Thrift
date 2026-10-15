'use client';
import { useEffect, useState } from 'react';
import { Sidebar, adminNav } from '@/components/Sidebar';
import { api } from '@/lib/api';

export default function AdminOverview() {
  const [d, setD] = useState<Record<string, number> | null>(null);
  useEffect(() => { api.get<typeof d>('/api/admin/dashboard').then(setD).catch(() => setD(null)); }, []);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 grid gap-4 md:grid-cols-[220px_1fr]">
      <Sidebar items={adminNav} />
      <div><h1 className="font-display text-3xl">ADMIN</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          {d ? Object.entries(d).map(([k, v]) => <div key={k} className="card p-4"><p className="text-xs">{k}</p><p className="font-display text-xl">{v}</p></div>)
            : <p className="card p-6 text-sm">Admin only. Login as admin@altairs.local.</p>}
        </div>
      </div>
    </div>
  );
}
