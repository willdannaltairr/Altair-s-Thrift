import Link from 'next/link';
import { idr, type Product } from '@/types';

export default function ProductCard({ p }: { p: Product }) {
  const img = p.images?.[0]?.url ?? 'https://picsum.photos/seed/fallback/600/800';
  return (
    <Link href={`/shop/${p.slug}`} className="card overflow-hidden group hover:border-ink transition">
      <div className="aspect-[3/4] overflow-hidden bg-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt={p.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-[1.03] transition" />
      </div>
      <div className="p-4 space-y-1">
        <p className="text-xs text-muted">{p.store?.name ?? 'UMKM'} {p.store && 'isVerified' in (p as object) ? '' : ''} • {p.condition.replace('_', ' ')}</p>
        <h3 className="font-semibold text-sm line-clamp-2">{p.name}</h3>
        <p className="font-display text-lg">{idr(p.price)}</p>
        <p className="text-xs">{p.stock > 0 ? `In stock (${p.stock})` : 'Sold out'}</p>
      </div>
    </Link>
  );
}
