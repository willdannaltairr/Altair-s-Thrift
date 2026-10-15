'use client';
import { api } from '@/lib/api';
import { AdminList } from '@/app/admin/users/page';

export default function AdminSellers() {
  return <AdminList title="SELLER VERIFICATIONS" path="/api/admin/sellers" render={(v: never) => `${(v as { businessName: string }).businessName} • ${(v as { user: { email: string } }).user.email}`} actions={(v: never, load) => (
    <span className="flex gap-2">
      <button className="btn-ghost !py-1" onClick={() => void api.patch(`/api/admin/sellers/${(v as { id: string }).id}/verify`, { action: 'APPROVE' }).then(load)}>Approve</button>
      <button className="btn-ghost !py-1" onClick={() => void api.patch(`/api/admin/sellers/${(v as { id: string }).id}/verify`, { action: 'REJECT', reason: 'Incomplete' }).then(load)}>Reject</button>
    </span>
  )} />;
}
