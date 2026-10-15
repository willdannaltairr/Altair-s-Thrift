'use client';
import { useEffect, useState } from 'react';
import { Sidebar, accountNav } from '@/components/Sidebar';
import { api } from '@/lib/api';

export default function AddressesPage() {
  const [rows, setRows] = useState<Array<{ id: string; label: string; recipient: string; city: string }>>([]);
  const [form, setForm] = useState({ recipient: '', phone: '', address: '', city: '', province: '', postalCode: '' });
  const load = () => api.get<typeof rows>('/api/addresses').then(setRows).catch(() => setRows([]));
  useEffect(() => { void load(); }, []);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 grid gap-4 md:grid-cols-[220px_1fr]">
      <Sidebar items={accountNav} />
      <div className="space-y-3">
        <h1 className="font-display text-3xl">ADDRESSES</h1>
        {rows.map((a) => <p key={a.id} className="card p-3 text-sm">{a.label} — {a.recipient}, {a.city}</p>)}
        <div className="card p-4 grid gap-2">
          {Object.keys(form).map((k) => <input key={k} placeholder={k} className="input" onChange={(e) => setForm({ ...form, [k]: e.target.value })} />)}
          <button className="btn-primary" onClick={() => void api.post('/api/addresses', { ...form, label: 'Home' }).then(load)}>Save address</button>
        </div>
      </div>
    </div>
  );
}
