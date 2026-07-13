'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/dashboard', label: 'DASHBOARD' },
  { href: '/numbers', label: 'VIRTUAL NUMBERS' },
  { href: '/smm', label: 'SMM PANEL' },
  { href: '/accounts', label: 'BUY ACCOUNTS' },
  { href: '/fund', label: 'FUND WALLET' },
  { href: '/orders', label: 'MY ORDERS' },
  { href: '/history', label: 'TRANSACTION HISTORY' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 bg-[#0f0f16] border-r border-[#2a2a3a] p-6 md:min-h-screen">
      <nav className="flex flex-col space-y-4">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`font-mono text-sm transition-colors flex items-center gap-2 ${
                active ? 'text-[#e11d3f] font-bold' : 'text-[#a0a0b0] hover:text-[#e11d3f]'
              }`}
            >
              <span className={active ? 'opacity-100' : 'opacity-40'}>{'>'}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
