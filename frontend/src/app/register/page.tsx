'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const r = useRouter();
  const [form, setForm] = useState({ email: '', password: '', fullName: '' });
  const [msg, setMsg] = useState('');
  return (
    <div className="mx-auto max-w-md px-4 py-12 space-y-3">
      <h1 className="font-display text-4xl">REGISTER</h1>
      <input className="input" placeholder="Full name" onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
      <input className="input" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input className="input" type="password" placeholder="Password min 8" onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button className="btn-primary w-full" onClick={() => api.post('/api/auth/register', form).then(() => r.push('/account')).catch((e: Error) => setMsg(e.message))}>Create account</button>
      {msg ? <p className="text-sm card p-3">{msg}</p> : null}
    </div>
  );
}
