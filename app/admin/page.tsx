'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AdminPage() {
  const [stats, setStats] = useState<any>({ totalUsers: 0, totalWalletBalance: 0, totalTransactions: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [showUserDetails, setShowUserDetails] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/users')
        ]);
        
        const statsData = await statsRes.json();
        const usersData = await usersRes.json();

        if (statsData.success) setStats(statsData);
        if (usersData.success) setUsers(usersData.users);
      } catch (error) {
        console.error('Admin fetch error:', error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = {
    labels: ['Users', 'Transactions', 'Revenue'],
    datasets: [
      {
        label: 'Overview',
        data: [stats.totalUsers, stats.totalTransactions, stats.totalWalletBalance],
        backgroundColor: ['rgba(0, 245, 255, 0.6)', 'rgba(184, 41, 221, 0.6)', 'rgba(0, 255, 136, 0.6)'],
        borderColor: ['rgba(0, 245, 255, 1)', 'rgba(184, 41, 221, 1)', 'rgba(0, 255, 136, 1)'],
        borderWidth: 2,
      },
    ],
  };

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
        <Link href="/dashboard" className="px-6 py-3 bg-gradient-to-r from-[#00f5ff] to-[#0080ff] rounded-lg font-bold text-black hover:shadow-[0_0_20px_rgba(0,245,255,0.5)] transition-all transform hover:scale-105">
          {`> EXIT_TO_SITE`}
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#1a1a25] to-[#0f0f16] border border-[#00f5ff]/30 rounded-xl p-6 hover:shadow-[0_0_30px_rgba(0,245,255,0.3)] transition-all transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#a0a0b0] font-mono text-sm">{`> TOTAL_USERS`}</h3>
            <span className="text-3xl">👥</span>
          </div>
          <p className="text-4xl font-bold text-[#00f5ff]">{stats.totalUsers}</p>
          <p className="text-[#00ff88] text-sm mt-2">Active Users</p>
        </div>

        <div className="bg-gradient-to-br from-[#1a1a25] to-[#0f0f16] border border-[#ffd700]/30 rounded-xl p-6 hover:shadow-[0_0_30px_rgba(255,215,0,0.3)] transition-all transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#a0a0b0] font-mono text-sm">{`> TOTAL_WALLET_BALANCE`}</h3>
            <span className="text-3xl">💰</span>
          </div>
          <p className="text-4xl font-bold text-[#ffd700]">₦{stats.totalWalletBalance.toLocaleString()}</p>
          <p className="text-[#00ff88] text-sm mt-2">Total Revenue</p>
        </div>

        <div className="bg-gradient-to-br from-[#1a1a25] to-[#0f0f16] border border-[#00ff88]/30 rounded-xl p-6 hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#a0a0b0] font-mono text-sm">{`> TOTAL_TRANSACTIONS`}</h3>
            <span className="text-3xl">📊</span>
          </div>
          <p className="text-4xl font-bold text-[#00ff88]">{stats.totalTransactions}</p>
          <p className="text-[#00f5ff] text-sm mt-2">All Time</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-gradient-to-br from-[#1a1a25] to-[#0f0f16] border border-[#2a2a3a] rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold text-[#e0e0e0] mb-6 font-mono">{`> ANALYTICS_OVERVIEW`}</h2>
        <div className="h-64">
          <canvas id="statsChart"></canvas>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gradient-to-br from-[#1a1a25] to-[#0f0f16] border border-[#2a2a3a] rounded-xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-[#e0e0e0] font-mono">{`> REGISTERED_USERS`}</h2>
          
          {/* Search */}
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-[#0f0f16] border border-[#2a2a3a] rounded-lg text-[#e0e0e0] focus:border-[#00f5ff] focus:outline-none focus:ring-2 focus:ring-[#00f5ff]/20"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a3a]">
                <th className="text-left p-4 text-[#00f5ff] font-mono text-sm">{`> NAME`}</th>
                <th className="text-left p-4 text-[#00f5ff] font-mono text-sm">{`> EMAIL`}</th>
                <th className="text-left p-4 text-[#00f5ff] font-mono text-sm">{`> BALANCE`}</th>
                <th className="text-left p-4 text-[#00f5ff] font-mono text-sm">{`> JOINED`}</th>
                <th className="text-left p-4 text-[#00f5ff] font-mono text-sm">{`> ACTIONS`}</th>
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
                      ₦{user.walletBalance?.toLocaleString() || 0}
                    </span>
                  </td>
                  <td className="p-4 text-[#a0a0b0] font-mono text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setShowUserDetails(showUserDetails === user._id ? null : user._id)}
                      className="px-4 py-2 bg-[#00f5ff]/10 border border-[#00f5ff]/30 rounded-lg text-[#00f5ff] hover:bg-[#00f5ff]/20 transition-all font-mono text-sm"
                    >
                      {showUserDetails === user._id ? 'HIDE' : 'VIEW'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#a0a0b0] font-mono">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
