'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/wallet/transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions);
      }
      setLoading(false);
    };
    fetchHistory();
  }, []);

  const getStatusColor = (status: string) => {
    if (status === 'success') return 'text-[#25d366] border-[#25d366]/30 bg-[#25d366]/10';
    if (status === 'pending') return 'text-[#e6a817] border-[#e6a817]/30 bg-[#e6a817]/10';
    return 'text-[#e11d3f] border-[#e11d3f]/30 bg-[#e11d3f]/10';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8">
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#b3001f] mb-4 transition-colors">
            ← Back to Dashboard
          </Link>
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#b3001f] mb-4 transition-colors">
            ← Back to Dashboard
          </Link>
          <div className="mb-8">
            <p className="terminal-text text-sm mb-2">{`> MODULE: TRANSACTION_LOGS`}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-[#e0e0e0]">HISTORY</h1>
          </div>
          
          <div className="card-dark">
            {loading ? (
              <p className="text-center text-[#a0a0b0] font-mono py-10">Loading logs...</p>
            ) : transactions.length === 0 ? (
              <p className="text-center text-[#a0a0b0] font-mono py-10">No transactions found. Start buying!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-mono">
                  <thead className="text-[#e11d3f] border-b border-[#2a2a3a]">
                    <tr>
                      <th className="p-3">TYPE</th>
                      <th className="p-3">DESCRIPTION</th>
                      <th className="p-3">AMOUNT</th>
                      <th className="p-3">STATUS</th>
                      <th className="p-3">DATE</th>
                    </tr>
                  </thead>
                  <tbody className="text-[#a0a0b0]">
                    {transactions.map((txn: any) => (
                      <tr key={txn._id} className="border-b border-[#2a2a3a] hover:bg-[#1a1a25] transition-colors">
                        <td className="p-3 text-[#e0e0e0] uppercase">{txn.type}</td>
                        <td className="p-3">{txn.description}</td>
                        <td className="p-3 text-[#e6a817]">₦{txn.amount}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs border ${getStatusColor(txn.status)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              txn.status === 'success' ? 'bg-[#25d366]' : txn.status === 'pending' ? 'bg-[#e6a817] animate-pulse' : 'bg-[#e11d3f]'
                            }`} />
                            {txn.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3">{new Date(txn.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
