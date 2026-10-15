import ProductCard from '@/components/ProductCard';
import { api } from '@/lib/api';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  return { title: `${params.slug} — Store — Altair's Thrift` };
}

export default async function StorePage({ params }: { params: { slug: string } }) {
  let store: {
    name: string; description?: string | null; location?: string | null; isVerified?: boolean;
    logoUrl?: string | null; bannerUrl?: string | null; theme?: string;
    products: Array<{ id: string; name: string; slug: string; price: number; condition: string; stock: number; images: Array<{ url: string }> }>;
    reviews: Array<{ rating: number; comment?: string | null; customer: { fullName: string } }>;
  } | null = null;
  try {
    store = await api.get<typeof store>(`/api/stores/${params.slug}`);
  } catch { store = null; }
  if (!store) return <div className="mx-auto max-w-5xl px-4 py-10"><p className="card p-8 text-sm">Store not found.</p></div>;
  const themeNote = store.theme === 'STREETWEAR' ? 'Bold streetwear preset' : store.theme === 'CLASSIC' ? 'Classic preset' : 'Minimal preset';
  return (
    <div>
      <div className="h-52 bg-cream overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {store.bannerUrl ? <img src={store.bannerUrl} alt={store.name} className="h-full w-full object-cover" /> : null}
      </div>
      <div className="mx-auto max-w-6xl px-4 -mt-8 flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {store.logoUrl ? <img src={store.logoUrl} alt={store.name} className="h-16 w-16 rounded-2xl border border-line object-cover bg-white" /> : null}
        <div>
          <h1 className="font-display text-3xl flex items-center gap-2">{store.name} {store.isVerified ? <span className="badge text-accent border-accent">Verified seller</span> : null}</h1>
          <p className="text-xs text-muted">{store.location} • {themeNote}</p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        <p className="text-sm max-w-2xl">{store.description}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {store.products.map((p) => <ProductCard key={p.id} p={p as never} />)}
        </div>
        {store.products.length === 0 ? <p className="text-sm text-muted">No published products yet.</p> : null}
        <div>
          <h2 className="font-semibold text-sm">Customer reviews</h2>
          {store.reviews.length === 0 ? <p className="text-xs text-muted">No reviews yet.</p> :
            store.reviews.map((r, i) => <p key={i} className="text-sm card p-3 mt-2">★ {r.rating} — {r.comment} <span className="text-xs text-muted">({r.customer.fullName})</span></p>)}
        </div>
      </div>
    </div>
  );
}
