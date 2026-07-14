'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

function isVideoUrl(url: string) {
  return /youtube\.com|youtu\.be|vimeo\.com/.test(url);
}

function toEmbedUrl(url: string) {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  return url;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="ml-2 px-2 py-1 text-xs rounded bg-white border border-gray-200 text-[#f97316] hover:bg-orange-50 font-semibold"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function OrdersInner() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(highlightId);

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
    if (status === 'success') return 'text-green-700 border-green-200 bg-green-50';
    if (status === 'pending') return 'text-amber-700 border-amber-200 bg-amber-50';
    return 'text-red-700 border-red-200 bg-red-50';
  };

  const renderAccountData = (accountData: any) => {
    if (!accountData) return null;
    if (typeof accountData === 'object') {
      return Object.entries(accountData).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
          <span className="text-gray-400 text-xs uppercase">{key}</span>
          <span className="flex items-center text-gray-800">
            {String(value)}
            <CopyButton text={String(value)} />
          </span>
        </div>
      ));
    }
    return (
      <div className="flex items-center justify-between">
        <span className="text-gray-800">{String(accountData)}</span>
        <CopyButton text={String(accountData)} />
      </div>
    );
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">My Orders</h1>
          </div>

          <div className="card">
            {loading ? (
              <p className="text-center text-gray-500 py-10">Loading orders...</p>
            ) : orders.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">No orders found yet.</p>
                <Link href="/dashboard" className="btn-primary inline-block px-6 py-2">Go to Dashboard</Link>
              </div>
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
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    {orders.map((order: any) => {
                      const hasDetails = order.type === 'account_purchase' && order.metadata?.accountData;
                      const isExpanded = expandedId === order._id;
                      return (
                        <>
                          <tr
                            key={order._id}
                            id={`order-${order._id}`}
                            className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                              highlightId === order._id ? 'bg-orange-50/50' : ''
                            }`}
                          >
                            <td className="p-3 text-gray-800 uppercase text-xs font-semibold">{order.type}</td>
                            <td className="p-3">{order.description}</td>
                            <td className="p-3 text-[#f97316] font-semibold">₦{order.amount}</td>
                            <td className="p-3">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs border ${getStatusColor(order.status)}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  order.status === 'success' ? 'bg-green-500' : order.status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
                                }`} />
                                {order.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="p-3">
                              {hasDetails && (
                                <button
                                  onClick={() => setExpandedId(isExpanded ? null : order._id)}
                                  className="text-[#f97316] text-xs font-semibold hover:underline"
                                >
                                  {isExpanded ? 'Hide' : 'View Logs'}
                                </button>
                              )}
                            </td>
                          </tr>
                          {hasDetails && isExpanded && (
                            <tr key={`${order._id}-details`} className="bg-gray-50 border-b border-gray-100">
                              <td colSpan={6} className="p-4">
                                <div className="max-w-xl">
                                  {order.metadata?.category && (
                                    <p className="text-xs text-[#f97316] font-semibold mb-2">{order.metadata.category}</p>
                                  )}
                                  <h4 className="text-gray-800 font-bold mb-2">Account Details</h4>
                                  <div className="bg-white rounded-lg p-4 mb-3 border border-gray-100">
                                    {renderAccountData(order.metadata.accountData)}
                                  </div>
                                  {order.metadata?.instructions && (
                                    <>
                                      <h4 className="text-gray-800 font-bold mb-2">Instructions</h4>
                                      <p className="text-gray-600 whitespace-pre-line text-xs mb-3">
                                        {order.metadata.instructions}
                                      </p>
                                    </>
                                  )}
                                  {order.metadata?.video && (
                                    <>
                                      <h4 className="text-gray-800 font-bold mb-2">Video Tutorial</h4>
                                      {isVideoUrl(order.metadata.video) ? (
                                        <div className="aspect-video max-w-md mb-2">
                                          <iframe
                                            src={toEmbedUrl(order.metadata.video)}
                                            className="w-full h-full rounded-lg"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                          />
                                        </div>
                                      ) : (
                                        <a
                                          href={order.metadata.video}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[#f97316] text-xs font-semibold hover:underline"
                                        >
                                          Watch Tutorial
                                        </a>
                                      )}
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
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

export default function OrdersPage() {
  return (
    <Suspense fallback={null}>
      <OrdersInner />
    </Suspense>
  );
}
