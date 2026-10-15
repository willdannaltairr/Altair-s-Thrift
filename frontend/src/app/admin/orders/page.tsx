'use client';
import { AdminList } from '@/app/admin/users/page';

export default function AdminOrders() {
  return <AdminList title="ORDERS" path="/api/admin/orders" render={(o: never) => `${(o as { orderNumber: string }).orderNumber} • ${(o as { orderStatus: string }).orderStatus}`} />;
}
