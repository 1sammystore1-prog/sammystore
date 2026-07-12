import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  return (
    <nav className="w-full bg-[#0f0f16] border-b border-[#2a2a3a] p-4 flex justify-between items-center sticky top-0 z-50">
      <Link href="/dashboard" className="text-2xl font-bold font-mono">
        <span className="text-[#00f5ff]">SAMMY</span>
        <span className="text-[#b829dd]">STORE</span>
      </Link>
      
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Link href="/dashboard" className="text-[#a0a0b0] hover:text-[#00f5ff] text-sm font-mono transition-colors">
          DASHBOARD
        </Link>
      </div>
    </nav>
  );
}
