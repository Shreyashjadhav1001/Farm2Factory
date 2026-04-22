import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search,
  FileText, 
  Map, 
  CreditCard, 
  Bell, 
  User, 
  HelpCircle,
  Menu,
  LogOut,
  Sprout
} from 'lucide-react';
import { useTranslate } from '../hooks/useTranslate';
import LanguageSwitcher from '../components/LanguageSwitcher';

const FarmerLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  const navLabels = [
    'Dashboard',
    'Factory Demands',
    'My Contributions',
    'Orders Tracking',
    'Earnings & Payments',
    'Notifications',
    'Profile & Ratings',
    'Support',
    'Logout'
  ];

  const translatedLabels = useTranslate(navLabels);

  const navItems = [
    { name: translatedLabels[0], path: '/farmer/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: translatedLabels[1], path: '/farmer/demands', icon: <Search size={20} /> },
    { name: translatedLabels[2], path: '/farmer/contributions', icon: <FileText size={20} /> },
    { name: translatedLabels[3], path: '/farmer/orders', icon: <Map size={20} /> },
    { name: translatedLabels[4], path: '/farmer/earnings', icon: <CreditCard size={20} /> },
    { name: translatedLabels[5], path: '/farmer/notifications', icon: <Bell size={20} /> },
    { name: translatedLabels[6], path: '/farmer/profile', icon: <User size={20} /> },
    { name: translatedLabels[7], path: '/farmer/support', icon: <HelpCircle size={20} /> },
  ];

  const pageTitle = navItems.find(item => location.pathname.includes(item.path))?.name || translatedLabels[0];

  return (
    <div className="min-h-screen bg-neutral-50 flex font-sans text-neutral-900">
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-neutral-200 fixed h-full z-20">
        <div className="h-16 flex items-center px-6 border-b border-neutral-200">
          <Sprout className="h-6 w-6 text-emerald-600 mr-2" />
          <span className="text-xl font-bold tracking-tight">Farm2Factory</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                  ? 'bg-neutral-100 text-neutral-900 font-semibold' 
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`
              }
            >
              <span className="text-neutral-500">{item.icon}</span>
              <span className="transition-opacity duration-300 opacity-100">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-200">
          <NavLink to="/" className="flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium text-neutral-600 hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut size={20} />
            <span className="transition-opacity duration-300 opacity-100">{translatedLabels[8]}</span>
          </NavLink>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0">
          <div className="flex items-center">
            <button 
              className="md:hidden mr-4 text-neutral-500 hover:text-neutral-900"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold tracking-tight transition-opacity duration-300 opacity-100">{pageTitle}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <button className="relative text-neutral-500 hover:text-neutral-900 transition-colors">
              <Bell size={20} />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
              R
            </div>
          </div>
        </header>

        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div className="fixed inset-0 bg-neutral-900/50" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="w-64 bg-white h-full relative z-10 flex flex-col shadow-xl">
               <div className="h-16 flex items-center px-6 border-b border-neutral-200">
                <span className="text-xl font-bold tracking-tight">Farm2Factory</span>
              </div>
              <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => 
                      `flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                        isActive 
                        ? 'bg-neutral-100 text-neutral-900 font-semibold' 
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                      }`
                    }
                  >
                    <span className="text-neutral-500">{item.icon}</span>
                    <span className="transition-opacity duration-300 opacity-100">{item.name}</span>
                  </NavLink>
                ))}
            </nav>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default FarmerLayout;
