'use client';
import { useEffect, useState } from 'react';
import { Sidebar, adminNav } from '@/components/Sidebar';
import { api } from '@/lib/api';

function useList<T>(path: string) {
  const [rows, setRows] = useState<T[]>([]);
  const load = () => api.get<T[]>(path).then(setRows).catch(() => setRows([]));
  useEffect(() => { void load(); }, [path]);
  return { rows, load };
}

export function AdminList({ title, path, render, actions }: { title: string; path: string; render: (r: never) => string; actions?: (r: never, reload: () => void) => React.ReactNode }) {
  const { rows, load } = useList<never>(path);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 grid gap-4 md:grid-cols-[220px_1fr]">
      <Sidebar items={adminNav} />
      <div className="space-y-2"><h1 className="font-display text-3xl">{title}</h1>
        {rows.map((r: never, i: number) => (
          <div key={i} className="card p-3 text-sm flex flex-wrap gap-2 items-center"><span className="flex-1">{render(r)}</span>{actions?.(r, load)}</div>
        ))}
        {rows.length === 0 ? <p className="card p-6 text-sm">Empty.</p> : null}
      </div>
    </div>
  );
}

export default function AdminUsers() {
  return <AdminList title="USERS" path="/api/admin/users" render={(u: never) => `${(u as { email: string }).email} • ${(u as { status: string }).status}`} actions={(u: never, load) => (
    <button className="btn-ghost !py-1" onClick={() => void api.patch(`/api/admin/users/${(u as { id: string }).id}`, { status: 'SUSPENDED' }).then(load)}>Suspend</button>
  )} />;
}
