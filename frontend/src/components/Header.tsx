'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShoppingBag, User } from 'lucide-react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/stores', label: 'Stores' },
  { href: '/about', label: 'About' },
];

export default function Header() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur border-b border-line">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center gap-6">
        <Link href="/" className="font-display text-xl tracking-wide">
          ALTAIR&rsquo;S <span className="text-accent">THRIFT</span>
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={path === l.href ? 'font-semibold text-ink' : 'text-muted hover:text-ink'}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/shop" aria-label="Search" className="p-2 rounded-full border border-line bg-white"><Search size={18} /></Link>
          <Link href="/cart" aria-label="Cart" className="p-2 rounded-full border border-line bg-white"><ShoppingBag size={18} /></Link>
          <Link href="/account" aria-label="Account" className="p-2 rounded-full bg-ink text-white"><User size={18} /></Link>
          <Link href="/seller" className="hidden sm:inline-flex btn-primary !py-2">Start Selling</Link>
        </div>
      </div>
      <div className="md:hidden border-t border-line px-4 py-2 flex gap-4 text-sm overflow-x-auto">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="text-muted">{l.label}</Link>
        ))}
      </div>
    </header>
  );
}
