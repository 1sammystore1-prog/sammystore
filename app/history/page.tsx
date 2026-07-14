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
    if (status === 'success') return 'text-green-700 border-green-200 bg-green-50';
    if (status === 'pending') return 'text-amber-700 border-amber-200 bg-amber-50';
    return 'text-red-700 border-red-200 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8">
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#f97316] mb-4 transition-colors">
            ← Back to Dashboard
          </Link>
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">History</h1>
          </div>

          <div className="card">
            {loading ? (
              <p className="text-center text-gray-500 py-10">Loading transactions...</p>
            ) : transactions.length === 0 ? (
              <p className="text-center text-gray-500 py-10">No transactions found. Start buying!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="p-3">Type</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    {transactions.map((txn: any) => (
                      <tr key={txn._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-3 text-gray-800 uppercase text-xs font-semibold">{txn.type}</td>
                        <td className="p-3">{txn.description}</td>
                        <td className="p-3 text-[#f97316] font-semibold">₦{txn.amount}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs border ${getStatusColor(txn.status)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              txn.status === 'success' ? 'bg-green-500' : txn.status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
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
