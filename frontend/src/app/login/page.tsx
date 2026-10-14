'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function LoginPage() {
  const r = useRouter();
  const [email, setEmail] = useState('customer1@altairs.local');
  const [password, setPassword] = useState('Customer123!');
  const [msg, setMsg] = useState('');
  return (
    <div className="mx-auto max-w-md px-4 py-12 space-y-3">
      <h1 className="font-display text-4xl">LOGIN</h1>
      <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
      <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
      <button className="btn-primary w-full" onClick={() => api.post('/api/auth/login', { email, password }).then(() => r.push('/account')).catch((e: Error) => setMsg(e.message))}>Login</button>
      {msg ? <p className="text-sm card p-3">{msg}</p> : null}
      <p className="text-sm text-muted">No account? <Link href="/register" className="text-accent font-semibold">Register</Link></p>
    </div>
  );
}
