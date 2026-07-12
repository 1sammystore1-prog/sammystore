'use client';
import { useState, useEffect } from 'react';
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
    if (status === 'success') return 'text-[#00ff88] border-[#00ff88]/30 bg-[#00ff88]/10';
    if (status === 'pending') return 'text-[#ffd700] border-[#ffd700]/30 bg-[#ffd700]/10';
    return 'text-[#ff2a6d] border-[#ff2a6d]/30 bg-[#ff2a6d]/10';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <div className="flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8">
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
                  <thead className="text-[#00f5ff] border-b border-[#2a2a3a]">
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
                        <td className="p-3 text-[#ffd700]">₦{txn.amount}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(txn.status)}`}>
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
