'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function FundPage() {
  const [method, setMethod] = useState('paystack');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleFund = async () => {
    if (!amount || amount < 100) {
      setMsg('Minimum amount is 100');
      return;
    }
    setLoading(true);
    setMsg('');

    if (method === 'paystack') {
      try {
        // Note: Replace with real user email/ID from your auth system later
        const res = await fetch('/api/wallet/fund-paystack', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'user@darknet.com', amount: amount, userId: 'user123' })
        });
        const data = await res.json();
        if (data.success && data.url) {
          window.location.href = data.url; // Redirect to Paystack
        } else {
          setMsg(data.error || 'Failed to start payment');
        }
      } catch (e) { setMsg('Network Error'); }
    } else {
      // Manual Transfer Logic
      setTimeout(() => {
        setMsg('Request submitted! Admin will verify your transfer.');
        setLoading(false);
      }, 1500);
      return; 
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <div className="flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8">
          <div className="mb-8">
            <p className="terminal-text text-sm mb-2">{`> MODULE: WALLET_FUNDING`}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-[#e0e0e0]">FUND WALLET</h1>
          </div>
          
          <div className="card-dark max-w-2xl">
            <div className="flex space-x-4 mb-6">
              <button onClick={() => setMethod('paystack')} className={`flex-1 py-3 rounded font-mono ${method === 'paystack' ? 'bg-[#00f5ff] text-black font-bold' : 'bg-[#1a1a25] text-[#a0a0b0]'}`}>PAYSTACK</button>
              <button onClick={() => setMethod('manual')} className={`flex-1 py-3 rounded font-mono ${method === 'manual' ? 'bg-[#ffd700] text-black font-bold' : 'bg-[#1a1a25] text-[#a0a0b0]'}`}>MANUAL</button>
            </div>

            <div className="mb-6">
              <label className="block text-[#00f5ff] text-sm font-mono mb-2">{`> AMOUNT (NGN)`}</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1000" className="input-dark" />
            </div>

            {method === 'manual' && (
              <div className="mb-6 p-4 bg-[#1a1a25] rounded border border-[#ffd700]/30">
                <p className="text-[#ffd700] font-mono text-sm mb-2">{`> BANK_DETAILS:`}</p>
                <p className="text-[#e0e0e0] font-mono">Bank: United Bank of Africa</p>
                <p className="text-[#e0e0e0] font-mono">Acc: 2136011152</p>
                <p className="text-[#e0e0e0] font-mono">Name: Akintan Ayomide Olamilekan</p>
              </div>
            )}

            <button onClick={handleFund} disabled={loading} className="btn-neon-green w-full">
              {loading ? 'PROCESSING...' : `FUND WITH ${method.toUpperCase()}`}
            </button>

            {msg && (
              <div className="mt-6 p-4 rounded text-center border border-[#00ff88] bg-[#00ff88]/10 text-[#00ff88]">
                <p className="font-mono font-bold">{msg}</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
