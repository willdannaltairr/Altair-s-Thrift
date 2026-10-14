'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { idr } from '@/types';

export default function CheckoutPage() {
  const r = useRouter();
  const [addresses, setAddresses] = useState<Array<{ id: string; label: string; recipient: string; address: string; city: string }>>([]);
  const [addressId, setAddressId] = useState('');
  const [courier, setCourier] = useState('JNE');
  const [msg, setMsg] = useState('');
  useEffect(() => { api.get<typeof addresses>('/api/addresses').then((a) => { setAddresses(a); if (a[0]) setAddressId(a[0].id); }).catch((e: Error) => setMsg(e.message)); }, []);
  const submit = async () => {
    setMsg('Processing...');
    try {
      const orders = await api.post<Array<{ id: string }>>('/api/orders', { addressId, courier });
      const first = orders[0];
      await api.post('/api/payments/create', { orderId: first.id });
      await api.post('/api/payments/simulate', { orderId: first.id, succeed: true });
      setMsg(`Paid (SANDBOX). ${orders.length} seller order(s) created — split per store.`);
      setTimeout(() => r.push('/account/orders'), 800);
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Checkout failed'); }
  };
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-4">
      <h1 className="font-display text-4xl">CHECKOUT</h1>
      <p className="text-xs text-muted">Review cart → address → courier → payment (sandbox) → confirm. Backend calculates totals; multi-store carts split into separate seller orders.</p>
      <select value={addressId} onChange={(e) => setAddressId(e.target.value)} className="input">
        {addresses.map((a) => <option key={a.id} value={a.id}>{a.label} — {a.recipient}, {a.address}, {a.city}</option>)}
      </select>
      <select value={courier} onChange={(e) => setCourier(e.target.value)} className="input">
        {['JNE','JNT','SICEPAT','GOJEK','POS'].map((c) => <option key={c}>{c}</option>)}
      </select>
      <button onClick={submit} className="btn-primary w-full">Confirm order &amp; pay (SANDBOX)</button>
      {msg ? <p className="text-sm card p-3">{msg}</p> : null}
    </div>
  );
}
