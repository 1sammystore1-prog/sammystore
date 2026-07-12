'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
      setLoading(false);
    };
    fetchOrders();
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
            <p className="terminal-text text-sm mb-2">{`> MODULE: ORDER_HISTORY`}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-[#e0e0e0]">MY ORDERS</h1>
          </div>
          
          <div className="card-dark">
            {loading ? (
              <p className="text-center text-[#a0a0b0] font-mono py-10">Loading orders...</p>
            ) : orders.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-[#a0a0b0] font-mono mb-4">No orders found yet.</p>
                <Link href="/dashboard" className="btn-neon-green inline-block px-6 py-2">Go to Dashboard</Link>
              </div>
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
                    {orders.map((order: any) => (
                      <tr key={order._id} className="border-b border-[#2a2a3a] hover:bg-[#1a1a25] transition-colors">
                        <td className="p-3 text-[#e0e0e0] uppercase">{order.type}</td>
                        <td className="p-3">{order.description}</td>
                        <td className="p-3 text-[#ffd700]">₦{order.amount}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(order.status)}`}>
                            {order.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3">{new Date(order.createdAt).toLocaleDateString()}</td>
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
