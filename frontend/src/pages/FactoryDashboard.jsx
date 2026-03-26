import React, { useState, useEffect } from 'react';
import { Home, ClipboardList, TrendingUp, IndianRupee, Bell, LogOut, PlusCircle, Trash2, Truck, Heart, Edit3, Users, CheckCircle, XCircle, UserMinus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import CreateDemandForm from '../components/CreateDemandForm';
import OrderManagement from '../components/OrderManagement';
import WishlistAndRating from '../components/WishlistAndRating';
import ParticipantsModal from '../components/ParticipantsModal';
import DashboardLayout from '../components/layout/DashboardLayout';

const FactoryDashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [demands, setDemands] = useState([]);
  const [stats, setStats] = useState([
    { title: 'Total Purchased', value: '0 Tons', icon: <TrendingUp className="h-6 w-6 text-blue-500" /> },
    { title: 'Active Demands', value: '0', icon: <ClipboardList className="h-6 w-6 text-indigo-500" /> },
    { title: 'Total Spend', value: '₹0', icon: <IndianRupee className="h-6 w-6 text-emerald-500" /> },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editDemandData, setEditDemandData] = useState(null);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [selectedDemandForParticipants, setSelectedDemandForParticipants] = useState(null);

  useEffect(() => {
    fetchDemands();
  }, []);

  const fetchDemands = async () => {
    try {
      const response = await apiClient.get('/demands/factory-demands');
      if (response.data && Array.isArray(response.data)) {
        setDemands(response.data);
        updateStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching demands:', err);
    }
  };

  const updateStats = (data) => {
    if (!Array.isArray(data)) return;
    
    const active = data.filter(d => d.status === 'OPEN').length;
    const totalPurchased = data.reduce((acc, current) => acc + (current.fulfilledQuantity || 0), 0);
    const totalSpend = data.reduce((acc, current) => acc + ((current.fulfilledQuantity || 0) * (current.ratePerTon || 0)), 0);

    setStats([
      { title: 'Total Purchased', value: `${totalPurchased.toLocaleString()} Tons`, icon: <TrendingUp className="h-6 w-6 text-blue-500" /> },
      { title: 'Active Demands', value: active.toString(), icon: <ClipboardList className="h-6 w-6 text-indigo-500" /> },
      { title: 'Total Spend', value: `₹${totalSpend.toLocaleString()}`, icon: <IndianRupee className="h-6 w-6 text-emerald-500" /> },
    ]);
  };

  const handleCreateDemand = () => {
    setEditDemandData(null);
    setIsModalOpen(true);
  };

  const handleEditDemand = (demand) => {
    setEditDemandData(demand);
    setIsModalOpen(true);
  };

  const handleViewParticipants = (demand) => {
    setSelectedDemandForParticipants(demand);
    setIsParticipantsModalOpen(true);
  };

  const handleLockOrder = async (id) => {
    try {
      await apiClient.patch(`/demands/lock-demand/${id}`);
      fetchDemands();
      alert(`Demand locked successfully.`);
    } catch (err) {
      alert('Failed to lock demand');
    }
  };

  const handleDeleteDemand = async (id) => {
    if (window.confirm('Are you sure you want to delete this demand?')) {
      try {
        await apiClient.delete(`/demands/delete-demand/${id}`);
        fetchDemands();
      } catch (err) {
        alert('Failed to delete demand');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold">
        Loading Factory Dashboard...
      </div>
    );
  }

  const navItems = [
    { 
      name: 'Dashboard', 
      icon: <Home size={18} />, 
      onClick: () => setActiveTab('dashboard'), 
      isActive: activeTab === 'dashboard' 
    },
    { 
      name: 'Manage Orders', 
      icon: <Truck size={18} />, 
      onClick: () => setActiveTab('orders'), 
      isActive: activeTab === 'orders' 
    },
    { 
      name: 'Wishlist', 
      icon: <Heart size={18} />, 
      onClick: () => setActiveTab('wishlist'), 
      isActive: activeTab === 'wishlist' 
    },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold">
        Loading Factory Dashboard...
      </div>
    );
  }

  return (
    <>
      <DashboardLayout 
        navItems={navItems} 
        user={user} 
        onLogout={handleLogout}
      >
      <div className="space-y-8">
        {activeTab === 'dashboard' ? (
          <>
            {/* Stats Overview */}
            <section>
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Platform Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, idx) => (
                  <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center space-x-4 transform transition hover:scale-[1.02]">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{stat.title}</p>
                      <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Post New Demand */}
              <section className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-slate-200 p-8 h-full flex flex-col justify-center items-center text-center group cursor-pointer hover:border-blue-400 transition-all" onClick={handleCreateDemand}>
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                     <PlusCircle className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Post New Demand</h3>
                  <p className="text-slate-500 text-sm mb-8">Broadcast your sugarcane requirements to all registered farmers in your zone instantly.</p>
                  <button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95"
                  >
                    Create Demand
                  </button>
                </div>
              </section>

              {/* Active Demands Progress */}
              <section className="lg:col-span-2">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Current Demands Progress</h2>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
                  <div className="p-6 space-y-6">
                    {demands.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[300px] text-slate-400">
                        <ClipboardList className="h-12 w-12 mb-4 opacity-20" />
                        <p>No active demands found</p>
                      </div>
                    ) : demands.map((demand, idx) => {
                      const percent = Math.min(100, Math.round((demand.fulfilledQuantity / demand.totalQuantityRequired) * 100));
                      const isLocked = demand.status === 'LOCKED';
                      
                      return (
                        <div key={demand._id} className={`p-6 rounded-2xl border transition-all ${isLocked ? 'border-slate-100 bg-slate-50/50 grayscale' : 'border-blue-100 bg-blue-50/20 shadow-sm hover:shadow-md'}`}>
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <span className="text-xs font-black text-slate-400 tracking-widest uppercase">#{demand._id.slice(-6)}</span>
                              <h4 className="text-lg font-bold text-slate-900 mt-1">{demand.title}</h4>
                              <div className="mt-2 flex items-center space-x-3">
                                <span className="font-black text-blue-600 text-xl">₹{demand.ratePerTon.toLocaleString()} / Ton</span>
                              </div>
                            </div>
                              <div className="flex space-x-2">
                                {!isLocked && (
                                  <button 
                                    onClick={() => handleLockOrder(demand._id)}
                                    className="px-5 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                  >
                                    Lock Order
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleDeleteDemand(demand._id)}
                                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                  title="Delete Demand"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                                {!isLocked && (
                                  <button 
                                    onClick={() => handleEditDemand(demand)}
                                    className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                                    title="Edit Demand"
                                  >
                                    <Edit3 className="h-5 w-5" />
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleViewParticipants(demand)}
                                  className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                                  title="View Participants"
                                >
                                  <Users className="h-5 w-5" />
                                </button>
                              </div>
                          </div>

                          <div className="relative pt-1">
                            <div className="flex mb-3 items-center justify-between">
                              <div>
                                <span className={`text-[10px] font-black inline-block py-1 px-3 uppercase rounded-full tracking-tighter ${isLocked ? 'text-slate-600 bg-slate-200' : 'text-blue-700 bg-blue-100'}`}>
                                  {isLocked ? 'Fulfilled & Locked' : `Progress: ${demand.demandType}`}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-black text-slate-800">
                                  {percent}%
                                </span>
                              </div>
                            </div>
                            <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-slate-200">
                              <div style={{ width: `${percent}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ${isLocked ? 'bg-slate-400' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`}></div>
                            </div>
                            <div className="flex justify-between text-sm font-medium text-slate-600">
                              <span>Fulfilled: <strong className="text-slate-900">{demand.fulfilledQuantity}</strong> Tons</span>
                              <span>Target: <strong className="text-slate-900">{demand.totalQuantityRequired}</strong> Tons</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            </div>
          </>
        ) : activeTab === 'orders' ? (
          <OrderManagement />
        ) : (
          <WishlistAndRating />
        )}
      </div>
      </DashboardLayout>

      {isModalOpen && (
        <CreateDemandForm 
          onClose={() => {
            setIsModalOpen(false);
            setEditDemandData(null);
          }} 
          onDemandCreated={fetchDemands} 
          editData={editDemandData}
        />
      )}

      {isParticipantsModalOpen && (
        <ParticipantsModal 
          demand={selectedDemandForParticipants}
          onClose={() => {
            setIsParticipantsModalOpen(false);
            setSelectedDemandForParticipants(null);
          }}
          onStatusUpdate={fetchDemands}
        />
      )}
    </>
  );
};

export default FactoryDashboard;
