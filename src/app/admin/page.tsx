'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Users,
  TrendingDown,
  TrendingUp,
  LogOut,
  Check,
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  username: string;
  balance: number;
}

interface Withdrawal {
  id: string;
  userId: string;
  user: { id: string; email: string; username: string };
  amount: number;
  walletAddress: string;
  status: string;
  txHash?: string;
}

interface Deposit {
  id: string;
  userId: string;
  user: { id: string; email: string; username: string };
  amount: number;
  txHash: string;
  status: string;
}

export default function AdminPanel() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState('credit');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [withdrawalId, setWithdrawalId] = useState('');
  const [txHash, setTxHash] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/');
          return;
        }

        // Verify admin status
        const userResponse = await fetch('/api/user', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = await userResponse.json();
        if (!userData.success || !userData.data.isAdmin) {
          router.push('/dashboard');
          return;
        }

        setCurrentUser(userData.data);

        // Fetch all data
        const [usersRes, depositsRes, withdrawalsRes] = await Promise.all([
          fetch('/api/admin/users', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/admin/deposits', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/admin/withdrawals', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const usersData = await usersRes.json();
        const depositsData = await depositsRes.json();
        const withdrawalsData = await withdrawalsRes.json();

        if (usersData.success) setUsers(usersData.data);
        if (depositsData.success) setDeposits(depositsData.data);
        if (withdrawalsData.success) setWithdrawals(withdrawalsData.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/admin/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUserId,
          amount: parseFloat(adjustAmount),
          type: adjustType,
          notes: adjustNotes,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh users list
        const usersRes = await fetch('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersData = await usersRes.json();
        if (usersData.success) setUsers(usersData.data);

        setSelectedUserId('');
        setAdjustAmount('');
        setAdjustType('credit');
        setAdjustNotes('');
      }
    } catch (error) {
      console.error('Error adjusting balance:', error);
    }
  };

  const handleApproveWithdrawal = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/admin/withdrawals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          withdrawalId: id,
          action: 'approve',
        }),
      });

      const data = await response.json();
      if (data.success) {
        const withdrawalsRes = await fetch('/api/admin/withdrawals', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const withdrawalsData = await withdrawalsRes.json();
        if (withdrawalsData.success) setWithdrawals(withdrawalsData.data);
      }
    } catch (error) {
      console.error('Error approving withdrawal:', error);
    }
  };

  const handleSendWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/admin/withdrawals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          withdrawalId,
          action: 'sent',
          txHash,
        }),
      });

      const data = await response.json();
      if (data.success) {
        const withdrawalsRes = await fetch('/api/admin/withdrawals', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const withdrawalsData = await withdrawalsRes.json();
        if (withdrawalsData.success) setWithdrawals(withdrawalsData.data);

        setWithdrawalId('');
        setTxHash('');
      }
    } catch (error) {
      console.error('Error sending withdrawal:', error);
    }
  };

  const handleConfirmDeposit = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/admin/deposits', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          depositId: id,
          action: 'confirm',
        }),
      });

      const data = await response.json();
      if (data.success) {
        const depositsRes = await fetch('/api/admin/deposits', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const depositsData = await depositsRes.json();
        if (depositsData.success) setDeposits(depositsData.data);
      }
    } catch (error) {
      console.error('Error confirming deposit:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="bg-black/30 border-b border-gray-800">
        <div className="container py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-gray-400">{currentUser?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary flex items-center gap-2"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-black/20 border-b border-gray-800">
        <div className="container flex gap-4 py-4">
          {[
            { id: 'users', label: 'Users', icon: Users },
            { id: 'deposits', label: 'Deposits', icon: TrendingUp },
            { id: 'withdrawals', label: 'Withdrawals', icon: TrendingDown },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded transition ${
                activeTab === id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={18} /> {label}
            </button>
          ))}
        </div>
      </div>

      <main className="container py-8">
        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Users List */}
            <div className="lg:col-span-2 card">
              <h2 className="text-xl font-bold mb-4">Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-700">
                    <tr>
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Username</th>
                      <th className="text-right py-2">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-800 hover:bg-slate-800/50"
                      >
                        <td className="py-3">{user.email}</td>
                        <td className="py-3">{user.username}</td>
                        <td className="text-right font-mono text-blue-300">
                          {user.balance.toFixed(8)} BTC
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Balance Adjustment Form */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Adjust Balance</h2>
              <form onSubmit={handleAdjustBalance} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Select User
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="input"
                    required
                  >
                    <option value="">Choose user...</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value)}
                    className="input"
                  >
                    <option value="credit">Credit (+)</option>
                    <option value="debit">Debit (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Amount (BTC)
                  </label>
                  <input
                    type="number"
                    step="0.00000001"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    className="input"
                    placeholder="0.1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    value={adjustNotes}
                    onChange={(e) => setAdjustNotes(e.target.value)}
                    className="input"
                    placeholder="Optional notes"
                    rows={2}
                  />
                </div>

                <button type="submit" className="btn btn-primary w-full">
                  Apply Change
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Deposits Tab */}
        {activeTab === 'deposits' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Pending Deposits</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-700">
                  <tr>
                    <th className="text-left py-2">User</th>
                    <th className="text-left py-2">TX Hash</th>
                    <th className="text-right py-2">Amount</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-center py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((deposit) => (
                    <tr
                      key={deposit.id}
                      className="border-b border-gray-800 hover:bg-slate-800/50"
                    >
                      <td className="py-3 text-sm">{deposit.user.email}</td>
                      <td className="py-3 font-mono text-xs text-gray-400">
                        {deposit.txHash.substring(0, 16)}...
                      </td>
                      <td className="text-right font-mono text-blue-300">
                        {deposit.amount.toFixed(8)} BTC
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            deposit.status === 'confirmed'
                              ? 'bg-green-900/50 text-green-300'
                              : 'bg-yellow-900/50 text-yellow-300'
                          }`}
                        >
                          {deposit.status}
                        </span>
                      </td>
                      <td className="text-center py-3">
                        {deposit.status === 'pending' && (
                          <button
                            onClick={() => handleConfirmDeposit(deposit.id)}
                            className="text-green-400 hover:text-green-300"
                          >
                            <Check size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Withdrawals Tab */}
        {activeTab === 'withdrawals' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Withdrawals List */}
            <div className="lg:col-span-2 card">
              <h2 className="text-xl font-bold mb-4">Withdrawal Requests</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {withdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="p-3 border border-slate-700 rounded"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{withdrawal.user.email}</p>
                        <p className="font-mono text-xs text-gray-400">
                          {withdrawal.walletAddress.substring(0, 20)}...
                        </p>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          withdrawal.status === 'sent'
                            ? 'bg-green-900/50 text-green-300'
                            : withdrawal.status === 'approved'
                              ? 'bg-blue-900/50 text-blue-300'
                              : 'bg-yellow-900/50 text-yellow-300'
                        }`}
                      >
                        {withdrawal.status}
                      </span>
                    </div>
                    <p className="text-blue-300 font-mono">
                      {withdrawal.amount.toFixed(8)} BTC
                    </p>
                    <div className="flex gap-2 mt-2">
                      {withdrawal.status === 'pending' && (
                        <button
                          onClick={() => handleApproveWithdrawal(withdrawal.id)}
                          className="btn btn-primary text-xs flex-1"
                        >
                          Approve
                        </button>
                      )}
                      {withdrawal.status === 'approved' && (
                        <button
                          onClick={() => setWithdrawalId(withdrawal.id)}
                          className="btn btn-primary text-xs flex-1"
                        >
                          Mark Sent
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mark as Sent Form */}
            {withdrawalId && (
              <div className="card">
                <h2 className="text-xl font-bold mb-4">Mark as Sent</h2>
                <form onSubmit={handleSendWithdrawal} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Transaction Hash
                    </label>
                    <input
                      type="text"
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      className="input"
                      placeholder="bitcoin tx hash"
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-full">
                    Confirm Sent
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawalId('')}
                    className="btn btn-secondary w-full"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
