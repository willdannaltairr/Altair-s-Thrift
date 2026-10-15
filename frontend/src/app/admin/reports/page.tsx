'use client';
import { api } from '@/lib/api';
import { AdminList } from '@/app/admin/users/page';

export default function AdminReports() {
  return <AdminList title="REPORTS" path="/api/admin/reports" render={(r: never) => `${(r as { reason: string }).reason} • ${(r as { status: string }).status}`} actions={(x: never, load) => (
    <button className="btn-ghost !py-1" onClick={() => void api.patch(`/api/admin/reports/${(x as { id: string }).id}`, { status: 'RESOLVED' }).then(load)}>Resolve</button>
  )} />;
}
