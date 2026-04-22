import React from 'react';
import { Home, Search, Truck, Wallet, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/layout/DashboardLayout';

const FarmerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const navItems = [
    { name: t('nav.overview'),  path: '/farmer-dashboard',          icon: <Home size={18} />,    end: true },
    { name: t('nav.demands'),   path: '/farmer-dashboard/demands',  icon: <Search size={18} /> },
    { name: t('nav.orders'),    path: '/farmer-dashboard/orders',   icon: <Truck size={18} /> },
    { name: t('nav.wallet'),    path: '/farmer-dashboard/wallet',   icon: <Wallet size={18} /> },
    { name: t('nav.profile'),   path: '/farmer-dashboard/profile',  icon: <UserIcon size={18} /> },
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
