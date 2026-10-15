'use client';
import { useState } from 'react';
import { Sidebar, sellerNav } from '@/components/Sidebar';
import { api } from '@/lib/api';

export default function CreateProduct() {
  const [form, setForm] = useState({ name: '', price: 100000, stock: 1, description: '', brand: '', color: '' });
  const [msg, setMsg] = useState('');
  const [ai, setAi] = useState('');
  const suggest = async () => {
    setAi('Generating...');
    try {
      const d = await api.post<{ description?: string; message?: string; manual?: boolean }>(`/api/ai/suggest`, { nameHint: form.name, brand: form.brand, colorHint: form.color });
      setAi(d.description ?? d.message ?? 'Manual mode');
    } catch (e) { setAi(e instanceof Error ? e.message : 'AI failed — continue manually'); }
  };
  const save = async (status = 'DRAFT') => {
    try {
      await api.post('/api/products', { ...form, status });
      setMsg(`Saved as ${status}. Submit PENDING_REVIEW for moderation.`);
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Save failed'); }
  };
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 grid gap-4 md:grid-cols-[240px_1fr]">
      <Sidebar items={sellerNav} />
      <div className="space-y-3">
        <h1 className="font-display text-3xl">CREATE + AI ASSISTANT</h1>
        <input className="input" placeholder="Product name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <input className="input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          <input className="input" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
          <input className="input" placeholder="Brand" onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          <input className="input" placeholder="Color" onChange={(e) => setForm({ ...form, color: e.target.value })} />
        </div>
        <textarea className="input" rows={4} placeholder="Description" onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={suggest}>Generate Suggestions</button>
          <button className="btn-ghost" onClick={suggest}>Regenerate</button>
          <button className="btn-primary" onClick={() => save('PENDING_REVIEW')}>Save &amp; Submit</button>
          <button className="btn-ghost" onClick={() => save('DRAFT')}>Save Draft</button>
        </div>
        {ai ? <p className="card p-3 text-sm">{ai}</p> : null}
        {msg ? <p className="card p-3 text-sm">{msg}</p> : null}
        <p className="text-xs text-muted">AI never invents defects/measurements/authenticity. Anything uncertain shows “Needs seller confirmation”. Works manually without API key.</p>
      </div>
    </div>
  );
}
