import StoreCard from '@/components/StoreCard';
import { api } from '@/lib/api';

export const metadata = { title: 'Stores — Altair’s Thrift' };

export default async function StoresPage() {
  let stores: Array<{ name: string; slug: string; logoUrl?: string | null; bannerUrl?: string | null; location?: string | null; isVerified?: boolean }> = [];
  try {
    stores = await api.get<typeof stores>('/api/stores');
  } catch { stores = []; }
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl">STORES</h1>
      <p className="text-sm text-muted mt-1">Verified UMKM storefronts.</p>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mt-6">
        {stores.map((s) => <StoreCard key={s.slug} s={s} />)}
      </div>
      {stores.length === 0 ? <p className="text-sm text-muted mt-4">No stores yet.</p> : null}
    </div>
  );
}
