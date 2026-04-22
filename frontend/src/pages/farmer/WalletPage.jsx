import React, { useState, useEffect } from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Plus, History } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const WalletPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [isDeposit, setIsDeposit] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [balanceRes, transRes] = await Promise.all([
          axios.get('/api/wallet/balance',      { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/wallet/transactions', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setBalance(balanceRes.data.balance);
        setTransactions(transRes.data || []);
      } catch (err) {
        console.error('Error fetching wallet data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAction = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount)) return;
    try {
      const token = localStorage.getItem('token');
      const endpoint = isDeposit ? 'add' : 'withdraw';
      const res = await axios.post(`/api/wallet/${endpoint}`,
        { amount: parseFloat(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBalance(res.data.balance);
      setAmount('');
      const transRes = await axios.get('/api/wallet/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(transRes.data || []);
      alert(`${isDeposit ? 'Deposit' : 'Withdrawal'} successful!`);
    } catch (err) {
      alert(err.response?.data?.message || 'Transaction failed');
    }
  };

  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  if (loading) return (
    <div className="p-20 text-center font-black text-slate-300 uppercase tracking-widest animate-pulse">
      {t('wallet.loading')}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Balance Card */}
        <div className="flex-1 bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>
          <div className="mb-10 flex justify-between items-start relative z-10 text-left">
            <div>
              <p className="text-neutral-400 font-medium tracking-wide uppercase text-xs mb-1">{t('wallet.totalBalance')}</p>
              <h2 className="text-5xl font-black tracking-tighter">₹{balance.toLocaleString()}</h2>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10">
              <WalletIcon size={28} className="text-emerald-400" />
            </div>
          </div>
          <div className="flex gap-4 relative z-10">
            <button onClick={() => setIsDeposit(true)} className={`flex-1 py-4 px-6 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${isDeposit ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/20' : 'bg-white/5 hover:bg-white/10'}`}>
              <Plus size={20} /> <span>{t('wallet.addMoney')}</span>
            </button>
            <button onClick={() => setIsDeposit(false)} className={`flex-1 py-4 px-6 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${!isDeposit ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/20' : 'bg-white/5 hover:bg-white/10'}`}>
              <ArrowDownLeft size={20} /> <span>{t('wallet.withdraw')}</span>
            </button>
          </div>
        </div>

        {/* Action Form */}
        <div className="w-full md:w-80 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 text-left">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            {isDeposit ? <Plus className="text-emerald-500" /> : <ArrowDownLeft className="text-amber-500" />}
            {isDeposit ? t('wallet.deposit') : t('wallet.withdraw')}
          </h3>
          <form onSubmit={handleAction} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">{t('wallet.amount')}</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-50 border-none px-5 py-4 rounded-xl text-lg font-bold outline-none ring-2 ring-transparent focus:ring-emerald-500/20 transition-all font-mono"
              />
            </div>
            {!isDeposit && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-[11px] leading-relaxed text-amber-700 font-medium">
                {user.kycStatus === 'unverified' ? (
                  <span className="text-red-600 font-bold">⚠️ {t('wallet.kycWarning')}</span>
                ) : (
                  t('wallet.transferNote')
                )}
              </div>
            )}
            <button
              disabled={!isDeposit && user.kycStatus === 'unverified'}
              className={`w-full py-4 rounded-xl font-black text-white shadow-lg transition-all active:scale-[0.98] ${
                !isDeposit && user.kycStatus === 'unverified'
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : isDeposit ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
              }`}
            >
              {t('wallet.proceed')}
            </button>
          </form>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-neutral-900 text-white rounded-2xl"><History size={20} /></div>
          <h3 className="text-2xl font-extrabold text-slate-800">{t('wallet.recentTransactions')}</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {safeTransactions.length > 0 ? safeTransactions.map((tx) => (
            <div key={tx._id} className="px-10 py-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-5">
                <div className={`p-3 rounded-2xl ${tx.type === 'credit' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                  {tx.type === 'credit' ? <ArrowUpRight size={22} /> : <ArrowDownLeft size={22} />}
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800 text-lg">{tx.description || 'Transaction'}</p>
                  <p className="text-sm text-slate-400 font-medium">{new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xl font-black ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-800'}`}>
                  {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                </p>
                <div className="flex items-center justify-end gap-1.5 mt-1">
                  <span className={`w-2 h-2 rounded-full ${tx.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{tx.status}</p>
                </div>
              </div>
            </div>
          )) : (
            <div className="p-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <History className="text-slate-300" />
              </div>
              <p className="font-bold text-slate-400">{t('wallet.noTransactions')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
