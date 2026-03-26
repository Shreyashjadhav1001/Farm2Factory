import React from 'react';
import { Home, Search, Truck, Wallet, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';

const FarmerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Overview', path: '/farmer-dashboard', icon: <Home size={18} />, end: true },
    { name: 'Nearby Demands', path: '/farmer-dashboard/demands', icon: <Search size={18} /> },
    { name: 'My Orders', path: '/farmer-dashboard/orders', icon: <Truck size={18} /> },
    { name: 'Wallet', path: '/farmer-dashboard/wallet', icon: <Wallet size={18} /> },
    { name: 'Profile', path: '/farmer-dashboard/profile', icon: <UserIcon size={18} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <DashboardLayout 
      navItems={navItems} 
      user={user} 
      onLogout={handleLogout} 
    />
  );
};

export default FarmerDashboard;
