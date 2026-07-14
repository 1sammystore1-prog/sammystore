'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

interface Activity {
  _id: string;
  type: string;
  description: string;
  amount: number;
  status: string;
  metadata?: any;
  createdAt: string;
}

interface RecentNumber {
  activationId: string;
  description: string;
  createdAt: string;
}

const TYPE_ICON: Record<string, string> = {
  virtual_number: '📞',
  smm: '🚀',
  account_purchase: '📱',
  deposit: '💳',
  manual_fund_request: '💳',
  refund: '↩️',
  withdrawal: '🏦',
  transfer: '🔁',
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function NumberStatusRow({ number }: { number: RecentNumber }) {
  const [status, setStatus] = useState<'loading' | 'pending' | 'completed' | 'cancelled' | 'released' | 'unknown' | 'error'>('loading');
  const [sms, setSms] = useState<string | null>(null);

  const checkStatus = async () => {
    setStatus('loading');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/numbers/tiger/sms?id=${number.activationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStatus(data.status);
        setSms(data.sms || null);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    checkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const badge: Record<string, string> = {
    loading: 'bg-gray-100 text-gray-600',
    pending: 'bg-[#e6a817]/10 text-[#e6a817]',
    completed: 'bg-[#25d366]/10 text-[#25d366]',
    cancelled: 'bg-[#e11d3f]/10 text-[#e11d3f]',
    released: 'bg-gray-100 text-gray-500',
    unknown: 'bg-gray-100 text-gray-500',
    error: 'bg-[#e11d3f]/10 text-[#e11d3f]',
  };

  return (
    <div className="card-dark flex items-center justify-between">
      <div>
        <p className="text-[#e0e0e0] font-semibold">{number.description}</p>
        <p className="text-[#a0a0b0] text-xs">{timeAgo(number.createdAt)}</p>
        {sms && <p className="text-[#25d366] text-sm font-mono mt-1">Code: {sms}</p>}
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badge[status]}`}>
          {status === 'loading' ? 'checking...' : status}
        </span>
        {status !== 'loading' && (
          <button onClick={checkStatus} className="text-[#a0a0b0] hover:text-[#e11d3f] text-xs">
            ↻
          </button>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [balance, setBalance] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [activeNumbers, setActiveNumbers] = useState(0);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [recentNumbers, setRecentNumbers] = useState<RecentNumber[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchBalance = async () => {
      const res = await fetch('/api/wallet/balance', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.balance !== undefined) setBalance(data.balance);
    };

    const fetchStats = async () => {
      const res = await fetch('/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTotalTransactions(data.totalTransactions);
        setActiveNumbers(data.activeNumbers);
        setRecentActivity(data.recentActivity || []);
        setRecentNumbers(data.recentNumbers || []);
      }
    };

    fetchBalance();
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8">
          <div className="mb-8">
            <p className="terminal-text text-sm mb-2">{`> SYSTEM_ACCESS: GRANTED`}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-[#e0e0e0]">DASHBOARD</h1>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="card-dark bg-gradient-to-br from-[#e11d3f]/10 to-[#0080ff]/10 border-[#e11d3f]/30">
              <h3 className="text-[#e11d3f] text-sm font-mono mb-2">{`> WALLET_BALANCE`}</h3>
              <p className="text-3xl md:text-4xl font-bold text-[#e0e0e0] mb-4">₦{balance.toLocaleString()}.00</p>
              <Link href="/fund" className="btn-neon-green text-sm py-2 px-4 inline-block">
                FUND WALLET
              </Link>
            </div>
            
            <div className="card-dark">
              <h3 className="text-[#8c0018] text-sm font-mono mb-2">{`> TOTAL_TRANSACTIONS`}</h3>
              <p className="text-3xl md:text-4xl font-bold text-[#e0e0e0]">{totalTransactions}</p>
            </div>

            <div className="card-dark">
              <h3 className="text-[#25d366] text-sm font-mono mb-2">{`> ACTIVE_NUMBERS`}</h3>
              <p className="text-3xl md:text-4xl font-bold text-[#e0e0e0]">{activeNumbers}</p>
            </div>
          </div>

          {recentNumbers.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[#e0e0e0] mb-4 font-mono">{`> LIVE_NUMBERS (last 24h)`}</h2>
              <div className="space-y-3">
                {recentNumbers.map((n) => (
                  <NumberStatusRow key={n.activationId} number={n} />
                ))}
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#e0e0e0] mb-4 font-mono">{`> RECENT_ACTIVITY`}</h2>
            {recentActivity.length === 0 ? (
              <div className="card-dark text-[#a0a0b0] text-sm">No activity yet - your purchases will show up here.</div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((tx) => (
                  <div key={tx._id} className="card-dark flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{TYPE_ICON[tx.type] || '•'}</span>
                      <div>
                        <p className="text-[#e0e0e0] font-semibold text-sm">{tx.description}</p>
                        <p className="text-[#a0a0b0] text-xs">{timeAgo(tx.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[#e11d3f] font-bold text-sm">₦{tx.amount.toLocaleString()}</span>
                      {tx.type === 'account_purchase' && tx.metadata?.productId && (
                        <Link
                          href={`/accounts/${tx.metadata.productId}`}
                          className="text-xs text-[#8c0018] hover:text-[#e11d3f] font-semibold whitespace-nowrap"
                        >
                          Buy Again
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <h2 className="text-2xl font-bold text-[#e0e0e0] mb-6 font-mono">{`> SERVICES`}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/numbers" className="card-dark group">
              <div className="text-4xl mb-4">📡</div>
              <h3 className="text-xl font-bold mb-2 text-[#e11d3f]">Virtual Numbers</h3>
              <p className="text-[#a0a0b0] text-sm">Rent anonymous numbers</p>
            </Link>
            <Link href="/smm" className="card-dark group">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2 text-[#8c0018]">SMM Panel</h3>
              <p className="text-[#a0a0b0] text-sm">Social media boost</p>
            </Link>
            <Link href="/accounts" className="card-dark group">
              <div className="text-4xl mb-4">🛍️</div>
              <h3 className="text-xl font-bold mb-2 text-[#e6a817]">Buy Accounts</h3>
              <p className="text-[#a0a0b0] text-sm">Pre-verified accounts</p>
            </Link>
            <Link href="/services" className="card-dark group">
              <div className="text-4xl mb-4">🗂️</div>
              <h3 className="text-xl font-bold mb-2 text-[#25d366]">Browse All</h3>
              <p className="text-[#a0a0b0] text-sm">Everything in one catalog</p>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
