'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const pathname = usePathname();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/wallet/balance', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.balance === 'number') setBalance(data.balance);
      })
      .catch(() => {});
  }, [pathname]);

  return (
    <nav className="w-full bg-[#0f0f16] border-b border-[#2a2a3a] p-4 flex justify-between items-center sticky top-0 z-50">
      <Link href="/dashboard" className="text-2xl font-bold font-mono">
        <span className="text-[#e11d3f]">SAMMY</span>
        <span className="text-[#8c0018]">STORE</span>
      </Link>

      <div className="flex items-center gap-4">
        {balance !== null && (
          <Link
            href="/fund"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a25] border border-[#2a2a3a] text-sm font-mono hover:border-[#e11d3f]/50 transition-colors"
          >
            <span className="text-[#a0a0b0]">Wallet</span>
            <span className="text-[#e11d3f] font-bold">₦{balance.toLocaleString()}</span>
          </Link>
        )}
        <ThemeToggle />
        <Link
          href="/dashboard"
          className={`text-sm font-mono transition-colors ${
            pathname === '/dashboard' ? 'text-[#e11d3f]' : 'text-[#a0a0b0] hover:text-[#e11d3f]'
          }`}
        >
          DASHBOARD
        </Link>
      </div>
    </nav>
  );
}
