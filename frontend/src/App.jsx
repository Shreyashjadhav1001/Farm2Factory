import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import FactoryDashboard from './pages/FactoryDashboard';
import FarmerDashboard from './pages/FarmerDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/" replace />;
  
  return children;
};

// Placeholder for unbuilt pages
const PendingPage = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] bg-white border border-neutral-200 rounded-2xl shadow-sm p-8 max-w-2xl mx-auto mt-10">
    <div className="bg-neutral-50 p-4 rounded-full mb-4">
      <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    </div>
    <h2 className="text-2xl font-bold text-neutral-900 mb-2">{title}</h2>
    <p className="text-neutral-500 text-center">This section is currently under development. Please check back later.</p>
  </div>
);

import DashboardOverview from './pages/farmer/DashboardOverview';
import FactoryDemands from './pages/farmer/FactoryDemands';
import OrderTracking from './pages/farmer/OrderTracking';
import FarmerKYC from './pages/farmer/FarmerKYC';
import WalletPage from './pages/farmer/WalletPage';
import FarmProfile from './pages/farmer/FarmProfile';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Farmer Routes */}
      <Route path="/farmer-dashboard" element={<ProtectedRoute allowedRole="farmer"><FarmerDashboard /></ProtectedRoute>}>
        <Route index element={<DashboardOverview />} />
        <Route path="demands" element={<FactoryDemands />} />
        <Route path="orders" element={<OrderTracking />} />
        <Route path="kyc" element={<FarmerKYC />} />
        <Route path="wallet" element={<WalletPage />} />
        <Route path="profile" element={<FarmProfile />} />
      </Route>

      {/* Factory Routes */}
      <Route path="/factory-dashboard" element={<ProtectedRoute allowedRole="factory"><FactoryDashboard /></ProtectedRoute>} />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
