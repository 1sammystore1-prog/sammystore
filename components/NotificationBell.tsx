'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface NotifTicket {
  _id: string;
  subject: string;
  messages: { sender: 'user' | 'admin'; message: string; createdAt: string }[];
  updatedAt: string;
}

// Customer-facing: polls their own tickets for ones with an unread admin
// reply (userUnread). Reused shape could later support an admin variant
// (adminUnread) if needed, but scoped to customer per current request.
export default function NotificationBell() {
  const router = useRouter();
  const [tickets, setTickets] = useState<NotifTicket[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/api/support/tickets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.tickets)) {
        setTickets(data.tickets.filter((t: any) => t.userUnread));
      }
    } catch {
      // silent - notification bell shouldn't break the page
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const goToTicket = (id: string) => {
    setOpen(false);
    router.push(`/support?ticket=${id}`);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <span className="text-xl">🔔</span>
        {tickets.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#f97316] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {tickets.length > 9 ? '9+' : tickets.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
          {tickets.length === 0 ? (
            <p className="text-sm text-gray-500 p-4 text-center">No new replies</p>
          ) : (
            tickets.map((t) => {
              const lastMsg = t.messages[t.messages.length - 1];
              return (
                <button
                  key={t._id}
                  onClick={() => goToTicket(t._id)}
                  className="w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-b-0"
                >
                  <p className="text-sm font-semibold text-gray-800 truncate">{t.subject}</p>
                  {lastMsg && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">{lastMsg.message}</p>
                  )}
                  <p className="text-[10px] text-gray-400 mt-1">{new Date(t.updatedAt).toLocaleString()}</p>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
