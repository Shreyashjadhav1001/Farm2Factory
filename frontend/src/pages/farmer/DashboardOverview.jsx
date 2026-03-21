import React, { useState, useEffect } from 'react';
import { IndianRupee, FileText, CheckCircle, Clock, Bell, MapPin, ChevronRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const DashboardOverview = () => {
  const [data, setData] = useState({
    walletBalance: 0,
    orders: [],
    pools: [],
    kycStatus: 'unverified'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/farmer/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error('Error fetching dashboard overview', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { title: 'Wallet Balance', value: `₹${data.walletBalance.toLocaleString()}`, icon: <IndianRupee className="text-emerald-600" size={24} />, bg: 'bg-emerald-50', link: '/farmer-dashboard/wallet' },
    { title: 'Active Orders', value: data.orders.filter(o => o.status !== 'DELIVERED').length.toString(), icon: <FileText className="text-blue-600" size={24} />, bg: 'bg-blue-50', link: '/farmer-dashboard/orders' },
    { title: 'Total Pools', value: data.pools.length.toString(), icon: <TrendingUp className="text-purple-600" size={24} />, bg: 'bg-purple-50', link: '/farmer-dashboard/orders' },
    { title: 'KYC Status', value: data.kycStatus.charAt(0).toUpperCase() + data.kycStatus.slice(1), icon: <CheckCircle className="text-orange-600" size={24} />, bg: 'bg-orange-50', link: '/farmer-dashboard/kyc' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center p-20 text-neutral-400 font-bold uppercase tracking-widest animate-pulse">
      Initializing Dashboard...
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Your Progress</h2>
          <p className="text-slate-500 font-medium mt-1">Real-time overview of your agricultural trade and earnings.</p>
        </div>
        <div className="flex gap-2">
           <Link to="/farmer-dashboard/demands" className="px-6 py-3 bg-neutral-900 text-white font-bold rounded-2xl shadow-xl hover:bg-neutral-800 transition active:scale-95">
             Explore Demands
           </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Link to={stat.link} key={idx} className="bg-white rounded-[2rem] border border-slate-100 p-8 flex flex-col gap-6 shadow-xl shadow-slate-200/40 hover:shadow-slate-300/50 hover:-translate-y-1 transition-all duration-300">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.title}</p>
              <p className="text-3xl font-black text-slate-900">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Orders Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Active Shipments</h3>
            <Link to="/farmer-dashboard/orders" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group">
              View all orders <ChevronRight size={18} className="group-hover:translate-x-1 transition" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {data.orders.length > 0 ? data.orders.slice(0, 3).map(order => (
              <div key={order._id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-lg shadow-slate-200/30 flex items-center justify-between hover:border-emerald-200 transition">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                    <FileText className="text-slate-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{order.demandId?.title || 'Sugarcane Demand'}</h4>
                    <p className="text-sm text-slate-400 font-medium">Qty: <span className="text-slate-700">{order.quantity} Tons</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                    order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {order.status}
                  </span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            )) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
                 <p className="font-bold text-slate-400">No active orders yet.</p>
                 <Link to="/farmer-dashboard/demands" className="text-emerald-600 font-bold text-sm hover:underline mt-2 inline-block">Find factory demands →</Link>
              </div>
            )}
          </div>
        </div>

        {/* Community Insight */}
        <div className="space-y-6">
          <h3 className="text-2xl font-black text-slate-900 px-2 tracking-tight">Financial Status</h3>
          <div className="bg-neutral-900 rounded-[2rem] p-8 text-white shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition">
               <TrendingUp size={120} />
            </div>
            <div className="relative z-10 space-y-8">
               <div>
                 <p className="text-neutral-500 font-bold text-xs uppercase tracking-widest mb-1">Upcoming Earnings</p>
                 <h4 className="text-4xl font-black tracking-tighter">₹{(data.orders.filter(o => o.status !== 'DELIVERED').reduce((acc, o) => acc + (o.quantity * 3200), 0)).toLocaleString()}</h4>
               </div>
               
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-neutral-500">Locked Contracts</span>
                    <span className="font-bold">{data.orders.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-neutral-500">Pool Participations</span>
                    <span className="font-bold">{data.pools.length}</span>
                  </div>
                  <div className="pt-4 border-t border-neutral-800">
                    <Link to="/farmer-dashboard/wallet" className="flex items-center justify-between text-emerald-400 font-bold hover:text-emerald-300 transition group">
                      Manage Wallet
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition" />
                    </Link>
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-xl shadow-slate-200/40">
             <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
               <Bell size={18} className="text-emerald-500" />
               Recent Activity
             </h4>
             <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">System: Geolocation updated to scanning 100km radius.</p>
                </div>
                <div className="flex gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-300 mt-2 shrink-0"></div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">KYC: Please complete your identity verification to enable withdrawals.</p>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardOverview;
