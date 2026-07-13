'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function FundPage() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/wallet/balance', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (typeof data.balance === 'number') setBalance(data.balance);
        })
        .catch(console.error);
    }
  }, []);

  const handleFund = async () => {
    setLoading(true);
    setMsg('');

    const token = localStorage.getItem('token');
    if (!token) {
      setMsgType('error');
      setMsg('Please login to fund your wallet');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/wallet/fund-paystack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: parseFloat(amount) })
      });
      const data = await res.json();

      if (data.success && data.url) {
        // Send the user to Paystack's hosted checkout. They'll be brought
        // back to /fund/callback afterwards, which verifies and credits.
        window.location.href = data.url;
        return;
      } else {
        setMsgType('error');
        setMsg(data.error || 'Failed to start payment');
      }
    } catch (error: any) {
      setMsgType('error');
      setMsg('Network error: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Fund Wallet</h1>
            <p className="text-gray-600">Add funds to your wallet to make purchases</p>
          </div>

          <div className="card p-6 md:p-8 max-w-2xl mb-8">
            <div className="text-center mb-8">
              <p className="text-sm text-gray-600 mb-2">Current Balance</p>
              <p className="text-4xl font-bold text-[#b3001f]">₦{balance.toLocaleString()}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₦)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="input-field"
                min="100"
                step="100"
              />
            </div>

            <button
              onClick={handleFund}
              disabled={loading || !amount}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Redirecting to Paystack...' : 'Pay with Paystack'}
            </button>

            {msg && (
              <div className={`mt-6 p-4 rounded-xl ${
                msgType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <p className="font-semibold">{msg}</p>
              </div>
            )}
          </div>

          <div className="card p-6 md:p-8 max-w-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Method</h2>
            <div className="flex items-center p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-[#b3001f] rounded-full flex items-center justify-center text-white text-xl mr-4">
                💳
              </div>
              <div>
                <p className="font-semibold text-gray-800">Paystack</p>
                <p className="text-sm text-gray-600">Pay securely by card, bank, or transfer via Paystack</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
