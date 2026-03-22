import React, { useState, useEffect } from 'react';
import { Home, Search, Truck, Wallet, User as UserIcon, Bell, LogOut, Menu, X, CheckCircle } from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const FarmerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);


  const navItems = [
    { name: 'Overview', path: '/farmer-dashboard', icon: <Home size={20} /> },
    { name: 'Nearby Demands', path: '/farmer-dashboard/demands', icon: <Search size={20} /> },
    { name: 'My Orders', path: '/farmer-dashboard/orders', icon: <Truck size={20} /> },
    { name: 'Wallet', path: '/farmer-dashboard/wallet', icon: <Wallet size={20} /> },
    { name: 'Profile', path: '/farmer-dashboard/profile', icon: <UserIcon size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-72 bg-neutral-900 text-white flex-col">
        <div className="h-20 flex items-center px-8 border-b border-neutral-800">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-white font-extrabold text-xl">F</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Farm2Factory</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/farmer'}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all group ${
                  isActive 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-neutral-900 text-white flex flex-col animate-in slide-in-from-left duration-300">
            <div className="h-20 flex items-center justify-between px-6 border-b border-neutral-800">
              <span className="text-xl font-bold">Farm2Factory</span>
              <button onClick={() => setSidebarOpen(false)} className="p-2 text-neutral-400 hover:text-white transition">
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/farmer-dashboard'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${
                      isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-neutral-400'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t border-neutral-800">
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-red-400 w-full transition">
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 flex-shrink-0 z-40">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg">
            <Menu size={24} />
          </button>
          
          <div className="hidden lg:block">
            <h1 className="text-xl font-bold text-slate-900">Farmer Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
            {(user?.kycStatus === 'verified' || user?.kycStatus === 'submitted') ? (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-xs font-bold uppercase tracking-wider">
                <CheckCircle size={14} />
                {user?.kycStatus === 'verified' ? 'Verified KYC' : 'KYC Submitted'}
              </div>
            ) : (
              <Link to="/farmer-dashboard/kyc" className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100 text-xs font-bold uppercase tracking-wider hover:bg-amber-100 transition">
                Pending KYC
              </Link>
            )}

            <button className="relative p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
              <Bell size={22} />
              <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm shadow-red-500/20"></span>
            </button>
            
            <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default FarmerDashboard;
