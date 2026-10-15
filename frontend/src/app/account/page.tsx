'use client';
import { useEffect, useState } from 'react';
import { Sidebar, accountNav } from '@/components/Sidebar';
import { api } from '@/lib/api';

export default function AccountPage() {
  const [me, setMe] = useState<{ fullName: string; email: string; roles: string[] } | null>(null);
  useEffect(() => { api.get<typeof me>('/api/auth/me').then(setMe).catch(() => setMe(null)); }, []);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 grid gap-4 md:grid-cols-[220px_1fr]">
      <Sidebar items={accountNav} />
      <div className="card p-6">
        <h1 className="font-display text-3xl">ACCOUNT</h1>
        {me ? <p className="text-sm mt-2">{me.fullName} • {me.email} • {me.roles.join(', ')}</p> : <p className="text-sm text-muted">Login to view dashboard.</p>}
      </div>
    </div>
  );
}
