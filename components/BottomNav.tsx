'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/dashboard', label: 'Home', icon: '🏠' },
  { href: '/catalog', label: 'Catalog', icon: '🏷️' },
  { href: '/orders', label: 'Orders', icon: '📦' },
  { href: '/settings', label: 'Account', icon: '👤' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-around items-center py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center gap-0.5 px-2 py-1 min-w-[56px]"
          >
            <span className={`text-xl transition-transform ${active ? 'scale-110' : 'opacity-60'}`}>
              {tab.icon}
            </span>
            <span
              className={`text-[10px] font-medium ${
                active ? 'text-[#f97316] font-bold' : 'text-gray-500'
              }`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
