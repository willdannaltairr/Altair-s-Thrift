'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { idr } from '@/types';
import { EmptyState, Skeleton } from '@/components/Feedback';

export default function CartPage() {
  const [cart, setCart] = useState<{ items: Array<{ id: string; qty: number; product: { id: string; name: string; price: number; stock: number; slug: string } }>; subtotal: number; totalQty: number } | null>(null);
  const [err, setErr] = useState('');
  const load = () => api.get<typeof cart>('/api/cart').then(setCart).catch((e: Error) => setErr(e.message));
  useEffect(() => { void load(); }, []);
  if (err) return <div className="mx-auto max-w-3xl px-4 py-10"><EmptyState title="Please login to view cart" hint={err} action={<Link href="/login" className="btn-primary">Login</Link>} /></div>;
  if (!cart) return <div className="mx-auto max-w-3xl px-4 py-10 space-y-2"><Skeleton className="h-20" /><Skeleton className="h-20" /></div>;
  if (cart.items.length === 0) return <div className="mx-auto max-w-3xl px-4 py-10"><EmptyState title="Your cart is currently empty." action={<Link href="/shop" className="btn-primary">Explore Products</Link>} /></div>;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-3">
      <h1 className="font-display text-4xl">CART ({cart.totalQty})</h1>
      {cart.items.map((it) => (
        <div key={it.id} className="card p-4 flex items-center gap-4">
          <div className="flex-1"><p className="font-semibold text-sm">{it.product.name}</p><p className="text-sm">{idr(it.product.price)} × {it.qty}</p></div>
          <button className="btn-ghost !py-2" onClick={() => void api.patch(`/api/cart/items/${it.id}`, { qty: Math.max(1, it.qty - 1) }).then(load)}>−</button>
          <button className="btn-ghost !py-2" onClick={() => void api.patch(`/api/cart/items/${it.id}`, { qty: Math.min(99, it.qty + 1) }).then(load)}>+</button>
          <button className="text-xs text-red-600" onClick={() => void api.del(`/api/cart/items/${it.id}`).then(load)}>Remove</button>
        </div>
      ))}
      <div className="card p-4 flex items-center justify-between"><p className="font-semibold">Subtotal {idr(cart.subtotal)}</p><Link href="/checkout" className="btn-primary">Proceed to checkout</Link></div>
      <p className="text-xs text-muted">Adding to cart does not reserve inventory. Stock is re-validated at checkout.</p>
    </div>
  );
}
