'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [stats, setStats] = useState<any>({ totalUsers: 0, totalWalletBalance: 0, totalTransactions: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [modal, setModal] = useState<{ type: string; userId?: string; userName?: string } | null>(null);
  const [modalAmount, setModalAmount] = useState('');
  const [modalReason, setModalReason] = useState('');
  const [modalSuspendReason, setModalSuspendReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, txnRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/transactions')
      ]);
      
      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const txnData = await txnRes.json();

      if (statsData.success) setStats(statsData);
      if (usersData.success) setUsers(usersData.users);
      if (txnData.success) setTransactions(txnData.transactions);
    } catch (error) {
      console.error('Admin fetch error:', error);
    }
    setLoading(false);
  };

  const handleAction = async () => {
    if (!modal) return;
    setActionLoading(true);
    setMsg('');

    try {
      let endpoint = '';
      let body: any = {};

      if (modal.type === 'add') {
        endpoint = '/api/admin/add-money';
        body = { userId: modal.userId, amount: modalAmount, reason: modalReason };
      } else if (modal.type === 'deduct') {
        endpoint = '/api/admin/deduct-money';
        body = { userId: modal.userId, amount: modalAmount, reason: modalReason };
      } else if (modal.type === 'suspend') {
        endpoint = '/api/admin/suspend';
        body = { userId: modal.userId, suspended: true, reason: modalSuspendReason };
      } else if (modal.type === 'unsuspend') {
        endpoint = '/api/admin/suspend';
        body = { userId: modal.userId, suspended: false, reason: '' };
      } else if (modal.type === 'delete') {
        endpoint = '/api/admin/delete-user';
        body = { userId: modal.userId };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (data.success) {
        setMsgType('success');
        setMsg(data.message || 'Action completed successfully!');
        setModal(null);
        setModalAmount('');
        setModalReason('');
        setModalSuspendReason('');
        fetchData();
      } else {
        setMsgType('error');
        setMsg(data.error || 'Action failed');
      }
    } catch (error: any) {
      setMsgType('error');
      setMsg('Network error: ' + error.message);
    }
    setActionLoading(false);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a25] to-[#0f0f16] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00f5ff] mx-auto mb-4"></div>
          <p className="text-[#00ff88] font-mono">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a25] to-[#0f0f16] p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#00f5ff] via-[#b829dd] to-[#00ff88] bg-clip-text text-transparent">
            ADMIN DASHBOARD
          </h1>
          <p className="text-[#a0a0b0] font-mono mt-2">{`> SYSTEM_CONTROL_CENTER`}</p>
        </div>
        <Link href="/dashboard" className="px-6 py-3 bg-gradient-to-r from-[#00f5ff] to-[#0080ff] rounded-lg font-bold text-black hover:shadow-[0_0_20px_rgba(0,245,255,0.5)] transition-all">
          {`> EXIT_TO_SITE`}
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#1a1a25] to-[#0f0f16] border border-[#00f5ff]/30 rounded-xl p-6 hover:shadow-[0_0_30px_rgba(0,245,255,0.3)] transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#a0a0b0] font-mono text-sm">{`> TOTAL_USERS`}</h3>
            <span className="text-3xl">👥</span>
          </div>
          <p className="text-4xl font-bold text-[#00f5ff]">{stats.totalUsers}</p>
        </div>

        <div className="bg-gradient-to-br from-[#1a1a25] to-[#0f0f16] border border-[#ffd700]/30 rounded-xl p-6 hover:shadow-[0_0_30px_rgba(255,215,0,0.3)] transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#a0a0b0] font-mono text-sm">{`> TOTAL_WALLET_BALANCE`}</h3>
            <span className="text-3xl">💰</span>
          </div>
          <p className="text-4xl font-bold text-[#ffd700]">₦{stats.totalWalletBalance.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-[#1a1a25] to-[#0f0f16] border border-[#00ff88]/30 rounded-xl p-6 hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#a0a0b0] font-mono text-sm">{`> TOTAL_TRANSACTIONS`}</h3>
            <span className="text-3xl">📊</span>
          </div>
          <p className="text-4xl font-bold text-[#00ff88]">{stats.totalTransactions}</p>
        </div>
      </div>

      {/* Message */}
      {msg && (
        <div className={`mb-6 p-4 rounded-lg border ${msgType === 'success' ? 'border-[#00ff88] bg-[#00ff88]/10 text-[#00ff88]' : 'border-[#ff2a6d] bg-[#ff2a6d]/10 text-[#ff2a6d]'}`}>
          <p className="font-mono font-bold">{msg}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button onClick={() => setActiveTab('users')} className={`px-6 py-3 rounded-lg font-mono font-bold transition-all ${activeTab === 'users' ? 'bg-[#00f5ff] text-black' : 'bg-[#1a1a25] text-[#a0a0b0] border border-[#2a2a3a]'}`}>
          👥 USERS
        </button>
        <button onClick={() => setActiveTab('transactions')} className={`px-6 py-3 rounded-lg font-mono font-bold transition-all ${activeTab === 'transactions' ? 'bg-[#b829dd] text-white' : 'bg-[#1a1a25] text-[#a0a0b0] border border-[#2a2a3a]'}`}>
           TRANSACTIONS
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-gradient-to-br from-[#1a1a25] to-[#0f0f16] border border-[#2a2a3a] rounded-xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-[#e0e0e0] font-mono">{`> REGISTERED_USERS`}</h2>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-[#0f0f16] border border-[#2a2a3a] rounded-lg text-[#e0e0e0] focus:border-[#00f5ff] focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a3a]">
                  <th className="text-left p-4 text-[#00f5ff] font-mono text-sm">USER</th>
                  <th className="text-left p-4 text-[#00f5ff] font-mono text-sm">EMAIL</th>
                  <th className="text-left p-4 text-[#00f5ff] font-mono text-sm">BALANCE</th>
                  <th className="text-left p-4 text-[#00f5ff] font-mono text-sm">STATUS</th>
                  <th className="text-left p-4 text-[#00f5ff] font-mono text-sm">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-[#2a2a3a] hover:bg-[#1a1a25]/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00f5ff] to-[#b829dd] flex items-center justify-center text-black font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[#e0e0e0]">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-[#a0a0b0]">{user.email}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-[#ffd700]/10 border border-[#ffd700]/30 rounded-full text-[#ffd700] font-mono">
                        ₦{(user.walletBalance || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.suspended ? (
                        <span className="px-3 py-1 bg-[#ff2a6d]/10 border border-[#ff2a6d]/30 rounded-full text-[#ff2a6d] font-mono text-xs">
                          SUSPENDED
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-full text-[#00ff88] font-mono text-xs">
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setModal({ type: 'add', userId: user._id, userName: user.name })} className="px-3 py-1 bg-[#00ff88]/20 border border-[#00ff88]/30 rounded text-[#00ff88] text-xs font-mono hover:bg-[#00ff88]/30">
                          + ADD
                        </button>
                        <button onClick={() => setModal({ type: 'deduct', userId: user._id, userName: user.name })} className="px-3 py-1 bg-[#ff2a6d]/20 border border-[#ff2a6d]/30 rounded text-[#ff2a6d] text-xs font-mono hover:bg-[#ff2a6d]/30">
                          - DEDUCT
                        </button>
                        {user.suspended ? (
                          <button onClick={() => setModal({ type: 'unsuspend', userId: user._id, userName: user.name })} className="px-3 py-1 bg-[#00f5ff]/20 border border-[#00f5ff]/30 rounded text-[#00f5ff] text-xs font-mono hover:bg-[#00f5ff]/30">
                            UNSUSPEND
                          </button>
                        ) : (
                          <button onClick={() => setModal({ type: 'suspend', userId: user._id, userName: user.name })} className="px-3 py-1 bg-[#ffd700]/20 border border-[#ffd700]/30 rounded text-[#ffd700] text-xs font-mono hover:bg-[#ffd700]/30">
                            SUSPEND
                          </button>
                        )}
                        <button onClick={() => setModal({ type: 'delete', userId: user._id, userName: user.name })} className="px-3 py-1 bg-[#ff2a6d]/20 border border-[#ff2a6d]/30 rounded text-[#ff2a6d] text-xs font-mono hover:bg-[#ff2a6d]/30">
                          DELETE
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-gradient-to-br from-[#1a1a25] to-[#0f0f16] border border-[#2a2a3a] rounded-xl p-6">
          <h2 className="text-2xl font-bold text-[#e0e0e0] font-mono mb-6">{`> ALL_TRANSACTIONS`}</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a3a]">
                  <th className="text-left p-4 text-[#00f5ff] font-mono text-sm">TYPE</th>
                  <th className="text-left p-4 text-[#00f5ff] font-mono text-sm">DESCRIPTION</th>
                  <th className="text-left p-4 text-[#00f5ff] font-mono text-sm">AMOUNT</th>
                  <th className="text-left p-4 text-[#00f5ff] font-mono text-sm">STATUS</th>
                  <th className="text-left p-4 text-[#00f5ff] font-mono text-sm">DATE</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn: any) => (
                  <tr key={txn._id} className="border-b border-[#2a2a3a] hover:bg-[#1a1a25]/50">
                    <td className="p-4 text-[#e0e0e0] uppercase font-mono text-xs">{txn.type}</td>
                    <td className="p-4 text-[#a0a0b0] text-sm">{txn.description}</td>
                    <td className="p-4 text-[#ffd700] font-mono">₦{txn.amount?.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-mono ${txn.status === 'success' ? 'bg-[#00ff88]/10 text-[#00ff88]' : txn.status === 'pending' ? 'bg-[#ffd700]/10 text-[#ffd700]' : 'bg-[#ff2a6d]/10 text-[#ff2a6d]'}`}>
                        {txn.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-[#a0a0b0] text-sm">{new Date(txn.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a25] border border-[#2a2a3a] rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-[#e0e0e0] mb-4 font-mono">
              {modal.type === 'add' && `➕ Add Money to ${modal.userName}`}
              {modal.type === 'deduct' && `➖ Deduct Money from ${modal.userName}`}
              {modal.type === 'suspend' && `🚫 Suspend ${modal.userName}`}
              {modal.type === 'unsuspend' && `✅ Unsuspend ${modal.userName}`}
              {modal.type === 'delete' && `⚠️ Delete ${modal.userName}?`}
            </h3>

            {(modal.type === 'add' || modal.type === 'deduct') && (
              <>
                <div className="mb-4">
                  <label className="block text-[#00f5ff] text-sm font-mono mb-2">{`> AMOUNT (₦)`}</label>
                  <input
                    type="number"
                    value={modalAmount}
                    onChange={(e) => setModalAmount(e.target.value)}
                    className="w-full px-4 py-2 bg-[#0f0f16] border border-[#2a2a3a] rounded-lg text-[#e0e0e0] focus:border-[#00f5ff] focus:outline-none"
                    placeholder="Enter amount"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-[#00f5ff] text-sm font-mono mb-2">{`> REASON (Optional)`}</label>
                  <input
                    type="text"
                    value={modalReason}
                    onChange={(e) => setModalReason(e.target.value)}
                    className="w-full px-4 py-2 bg-[#0f0f16] border border-[#2a2a3a] rounded-lg text-[#e0e0e0] focus:border-[#00f5ff] focus:outline-none"
                    placeholder="Reason for transaction"
                  />
                </div>
              </>
            )}

            {modal.type === 'suspend' && (
              <div className="mb-4">
                <label className="block text-[#ffd700] text-sm font-mono mb-2">{`> SUSPENSION_REASON`}</label>
                <textarea
                  value={modalSuspendReason}
                  onChange={(e) => setModalSuspendReason(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0f0f16] border border-[#2a2a3a] rounded-lg text-[#e0e0e0] focus:border-[#ffd700] focus:outline-none"
                  rows={3}
                  placeholder="Why is this user being suspended?"
                />
              </div>
            )}

            {modal.type === 'delete' && (
              <p className="text-[#ff2a6d] font-mono mb-4">
                This will permanently delete the user and all their transactions. This action cannot be undone.
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleAction}
                disabled={actionLoading || (modalAmount === '' && (modal.type === 'add' || modal.type === 'deduct'))}
                className={`flex-1 py-3 rounded-lg font-bold font-mono transition-all ${
                  modal.type === 'add' ? 'bg-[#00ff88] text-black hover:bg-[#00ff88]/80' :
                  modal.type === 'deduct' ? 'bg-[#ff2a6d] text-white hover:bg-[#ff2a6d]/80' :
                  modal.type === 'suspend' ? 'bg-[#ffd700] text-black hover:bg-[#ffd700]/80' :
                  modal.type === 'unsuspend' ? 'bg-[#00f5ff] text-black hover:bg-[#00f5ff]/80' :
                  'bg-[#ff2a6d] text-white hover:bg-[#ff2a6d]/80'
                } disabled:opacity-50`}
              >
                {actionLoading ? 'PROCESSING...' : 'CONFIRM'}
              </button>
              <button
                onClick={() => { setModal(null); setModalAmount(''); setModalReason(''); setModalSuspendReason(''); }}
                className="px-6 py-3 bg-[#2a2a3a] text-[#a0a0b0] rounded-lg font-mono hover:bg-[#3a3a4a]"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
