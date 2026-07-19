'use client';

import Link from 'next/link';

export default function SupportWidget() {
  return (
    <Link
      href="/support"
      aria-label="Contact support"
      className="fixed bottom-20 md:bottom-6 right-4 z-50 w-14 h-14 rounded-full bg-[#f97316] shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
    >
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
        <path d="M12 2a10 10 0 0 0-10 10 9.9 9.9 0 0 0 1.32 4.95L2 22l5.29-1.39A9.9 9.9 0 0 0 12 22a10 10 0 0 0 0-20m0 2a8 8 0 0 1 8 8 8 8 0 0 1-8 8 7.9 7.9 0 0 1-4-1.09l-.29-.17-2.99.79.8-2.92-.19-.3A7.9 7.9 0 0 1 4 12a8 8 0 0 1 8-8m-.02 3.5c-.55 0-1 .45-1 1v3.5c0 .28.11.54.3.72l2.5 2.5a1 1 0 0 0 1.42-1.42l-2.2-2.2V8.5c0-.55-.44-1-1.02-1z" />
      </svg>
    </Link>
  );
}
