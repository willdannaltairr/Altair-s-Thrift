import Link from 'next/link';
import { idr } from '@/types';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  return { title: `${params.slug} — Altair's Thrift` };
}

export default async function ProductDetail({ params }: { params: { slug: string } }) {
  let data: {
    name: string; price: number; brand?: string | null; condition: string; size?: string | null;
    chestMeasurement?: string | null; lengthMeasurement?: string | null; material?: string | null;
    color?: string | null; defects?: string | null; stock: number; description?: string | null;
    images: Array<{ url: string; alt?: string | null }>;
    store: { name: string; slug: string; location?: string | null; isVerified?: boolean };
    related?: Array<{ id: string; name: string; slug: string; price: number; condition: string; stock: number; images: Array<{ url: string }> }>;
    reviews?: Array<{ rating: number; comment?: string | null; isVerifiedPurchase: boolean; customer: { fullName: string } }>;
  } | null = null;
  try {
    data = await api.get<typeof data>(`/api/products/${params.slug}`);
  } catch { data = null; }
  if (!data) return <div className="mx-auto max-w-5xl px-4 py-10"><p className="card p-8 text-sm">Product not found.</p></div>;
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 md:grid-cols-2">
      <div className="space-y-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={data.images[0]?.url ?? 'https://picsum.photos/seed/x/800/1000'} alt={data.name} className="rounded-2xl w-full object-cover aspect-[3/4]" />
        <div className="grid grid-cols-4 gap-2">
          {data.images.slice(1, 5).map((im, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={im.url} alt={data!.name} loading="lazy" className="rounded-xl h-20 w-full object-cover" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <Link href={`/store/${data.store.slug}`} className="text-xs text-accent font-semibold">{data.store.name} {data.store.isVerified ? '✓ Verified' : ''}</Link>
        <h1 className="font-display text-3xl">{data.name}</h1>
        <p className="font-display text-2xl">{idr(data.price)}</p>
        <p className="text-sm">Condition: <b>{data.condition}</b> • Size {data.size ?? '-'} • Stock {data.stock}</p>
        <div className="card p-4 text-sm space-y-1">
          <p>Brand: {data.brand ?? '-'}</p><p>Material: {data.material ?? '-'}</p><p>Color: {data.color ?? '-'}</p>
          <p>LD: {data.chestMeasurement ?? '-'} • P: {data.lengthMeasurement ?? '-'}</p>
          {data.defects ? <p className="text-amber-700">Disclosed defects: {data.defects}</p> : <p className="text-muted">No defects disclosed by seller.</p>}
          <p className="text-xs text-muted">Condition is as described by seller, not independently verified.</p>
        </div>
        <p className="text-sm leading-6">{data.description}</p>
        <AddToCart slug={params.slug} />
        <div>
          <h2 className="font-semibold text-sm mt-4">Verified reviews</h2>
          {(data.reviews ?? []).length === 0 ? <p className="text-xs text-muted">No reviews yet.</p> :
            (data.reviews ?? []).map((r, i) => <p key={i} className="text-sm card p-3 mt-2">★ {r.rating} — {r.comment} <span className="text-xs text-muted">({r.customer.fullName}{r.isVerifiedPurchase ? ' • Verified Purchase' : ''})</span></p>)}
        </div>
      </div>
      <div className="md:col-span-2">
        <h2 className="font-display text-xl mb-3">RELATED</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(data.related ?? []).map((p) => <ProductCard key={p.id} p={p as never} />)}
        </div>
      </div>
    </div>
  );
}

function AddToCart({ slug }: { slug: string }) {
  void slug;
  return <p className="text-xs text-muted">Add to cart from the <Link className="text-accent font-semibold" href="/cart">cart page</Link> after login — stock re-validated at checkout.</p>;
}
