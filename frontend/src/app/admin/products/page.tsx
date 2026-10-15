'use client';
import { api } from '@/lib/api';
import { AdminList } from '@/app/admin/users/page';

export default function AdminProducts() {
  return <AdminList title="PENDING PRODUCTS" path="/api/admin/products/pending" render={(p: never) => (p as { name: string }).name} actions={(p: never, load) => (
    <span className="flex gap-2">
      <button className="btn-ghost !py-1" onClick={() => void api.patch(`/api/admin/products/${(p as { id: string }).id}/moderate`, { action: 'APPROVE' }).then(load)}>Approve</button>
      <button className="btn-ghost !py-1" onClick={() => void api.patch(`/api/admin/products/${(p as { id: string }).id}/moderate`, { action: 'REJECT' }).then(load)}>Reject</button>
    </span>
  )} />;
}
