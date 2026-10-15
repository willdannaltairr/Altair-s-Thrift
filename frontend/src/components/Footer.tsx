import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-20 bg-charcoal text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <p className="font-display text-2xl">ALTAIR&rsquo;S THRIFT</p>
          <p className="text-sm text-white/70 mt-2">Discover Fashion. Empower Local Business.</p>
        </div>
        <div className="text-sm space-y-2">
          <p className="font-semibold">Shop</p>
          <Link className="block text-white/70" href="/shop">All products</Link>
          <Link className="block text-white/70" href="/stores">Stores</Link>
        </div>
        <div className="text-sm space-y-2">
          <p className="font-semibold">Sell</p>
          <Link className="block text-white/70" href="/seller">Open your store</Link>
          <Link className="block text-white/70" href="/about">Help Center</Link>
        </div>
        <div className="text-sm space-y-2">
          <p className="font-semibold">Legal</p>
          <Link className="block text-white/70" href="/about">Privacy Policy</Link>
          <Link className="block text-white/70" href="/about">Terms &amp; Conditions</Link>
          <p className="text-white/50 pt-2">Contact: hello@altairs.local</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">© 2026 Altair&apos;s Thrift — UMKM demo, no real personal data.</div>
    </footer>
  );
}
