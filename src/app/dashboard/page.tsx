'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Wallet, Send, TrendingUp, LogOut } from 'lucide-react';

interface User {
  id: string;
  email: string;
  username: string;
  balance: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [txHash, setTxHash] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [btcAddress, setBtcAddress] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/');
          return;
        }

        const response = await fetch('/api/user', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (data.success) {
          setUser(data.data);
          fetchDeposits(token);
          fetchWithdrawals(token);
          fetchConfig(token);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const fetchConfig = async (token: string) => {
    try {
      const response = await fetch('/api/admin/config', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setBtcAddress(data.data.depositAddress);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const fetchDeposits = async (token: string) => {
    try {
      const response = await fetch('/api/deposits', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setDeposits(data.data);
      }
    } catch (error) {
      console.error('Error fetching deposits:', error);
    }
  };

  const fetchWithdrawals = async (token: string) => {
    try {
      const response = await fetch('/api/withdrawals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setWithdrawals(data.data);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/deposits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: 0, txHash }),
      });

      const data = await response.json();
      if (data.success) {
        setTxHash('');
        fetchDeposits(token!);
      }
    } catch (error) {
      console.error('Error submitting deposit:', error);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
          walletAddress: withdrawAddress,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setWithdrawAmount('');
        setWithdrawAddress('');
        fetchWithdrawals(token!);
      }
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="bg-black/30 border-b border-gray-800">
        <div className="container py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Trading Dashboard</h1>
            <p className="text-gray-400">{user?.username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary flex items-center gap-2"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <main className="container py-8">
        {/* Balance Card */}
        <div className="card mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 mb-2">Current Balance</p>
              <p className="text-5xl font-bold">{user?.balance.toFixed(8)} BTC</p>
            </div>
            <Wallet size={64} className="text-blue-400 opacity-20" />
          </div>
        </div>

        {/* Action Tabs */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Deposit Section */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={24} /> Request Deposit
            </h2>

            <div className="mb-4 p-3 bg-green-900/30 border border-green-600 rounded">
              <p className="text-sm text-gray-400 mb-2">Send BTC to this address:</p>
              <p className="font-mono text-green-300 break-all">{btcAddress || 'Loading...'}</p>
            </div>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Transaction Hash (TX ID)
                </label>
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  className="input"
                  placeholder="bitcoin transaction hash"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-full">
                Submit Deposit
              </button>
            </form>

            {/* Deposit History */}
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Recent Deposits</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {deposits.length === 0 ? (
                  <p className="text-gray-500">No deposits yet</p>
                ) : (
                  deposits.map((deposit) => (
                    <div
                      key={deposit.id}
                      className="p-2 bg-slate-800 rounded border border-slate-700 text-sm"
                    >
                      <p className="font-mono text-xs text-gray-400">
                        {deposit.txHash.substring(0, 20)}...
                      </p>
                      <div className="flex justify-between mt-1">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            deposit.status === 'confirmed'
                              ? 'bg-green-900/50 text-green-300'
                              : 'bg-yellow-900/50 text-yellow-300'
                          }`}
                        >
                          {deposit.status}
                        </span>
                        <span className="text-blue-300">
                          +{deposit.amount.toFixed(8)} BTC
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Withdrawal Section */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Send size={24} /> Request Withdrawal
            </h2>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Amount (BTC)
                </label>
                <input
                  type="number"
                  step="0.00000001"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="input"
                  placeholder="0.1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  className="input"
                  placeholder="bitcoin address"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-full">
                Request Withdrawal
              </button>
            </form>

            {/* Withdrawal History */}
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Recent Withdrawals</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {withdrawals.length === 0 ? (
                  <p className="text-gray-500">No withdrawals yet</p>
                ) : (
                  withdrawals.map((withdrawal) => (
                    <div
                      key={withdrawal.id}
                      className="p-2 bg-slate-800 rounded border border-slate-700 text-sm"
                    >
                      <p className="font-mono text-xs text-gray-400">
                        {withdrawal.walletAddress.substring(0, 20)}...
                      </p>
                      <div className="flex justify-between mt-1">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            withdrawal.status === 'sent'
                              ? 'bg-green-900/50 text-green-300'
                              : withdrawal.status === 'approved'
                                ? 'bg-blue-900/50 text-blue-300'
                                : withdrawal.status === 'cancelled'
                                  ? 'bg-red-900/50 text-red-300'
                                  : 'bg-yellow-900/50 text-yellow-300'
                          }`}
                        >
                          {withdrawal.status}
                        </span>
                        <span className="text-red-300">
                          -{withdrawal.amount.toFixed(8)} BTC
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
