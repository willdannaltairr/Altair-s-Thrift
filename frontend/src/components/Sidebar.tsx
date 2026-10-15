'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar({ items }: { items: Array<{ href: string; label: string }> }) {
  const p = usePathname();
  return (
    <nav className="card p-3 space-y-1 md:sticky md:top-20">
      {items.map((i) => (
        <Link key={i.href} href={i.href} className={`block px-3 py-2 rounded-xl text-sm ${p === i.href ? 'bg-ink text-white' : 'hover:bg-cream'}`}>{i.label}</Link>
      ))}
    </nav>
  );
}

export const accountNav = [
  { href: '/account', label: 'Dashboard' },
  { href: '/account/orders', label: 'Orders' },
  { href: '/account/addresses', label: 'Addresses' },
];

export const sellerNav = [
  { href: '/seller', label: 'Overview' },
  { href: '/seller/products', label: 'Products' },
  { href: '/seller/products/create', label: 'Create Product + AI' },
  { href: '/seller/inventory', label: 'Inventory' },
  { href: '/seller/orders', label: 'Orders' },
  { href: '/seller/analytics', label: 'Analytics' },
];

export const adminNav = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/sellers', label: 'Sellers' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/reports', label: 'Reports' },
];
