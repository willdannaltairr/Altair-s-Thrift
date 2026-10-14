import Link from 'next/link';

export default function StoreCard({ s }: { s: { name: string; slug: string; logoUrl?: string | null; bannerUrl?: string | null; location?: string | null; isVerified?: boolean; productCount?: number } }) {
  return (
    <Link href={`/store/${s.slug}`} className="card overflow-hidden hover:border-ink transition">
      <div className="h-28 bg-cream overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {s.bannerUrl ? <img src={s.bannerUrl} alt={s.name} loading="lazy" className="h-full w-full object-cover" /> : null}
      </div>
      <div className="p-4 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {s.logoUrl ? <img src={s.logoUrl} alt={s.name} className="h-10 w-10 rounded-full object-cover border border-line" /> : <div className="h-10 w-10 rounded-full bg-accentSoft" />}
        <div>
          <p className="font-semibold text-sm flex items-center gap-1">
            {s.name}
            {s.isVerified ? <span className="badge !py-0.5 !px-2 text-accent border-accent">Verified</span> : null}
          </p>
          <p className="text-xs text-muted">{s.location ?? ''}{typeof s.productCount === 'number' ? ` • ${s.productCount} products` : ''}</p>
        </div>
      </div>
    </Link>
  );
}
