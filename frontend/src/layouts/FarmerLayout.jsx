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

const FarmerLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/farmer/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Factory Demands', path: '/farmer/demands', icon: <Search size={20} /> },
    { name: 'My Contributions', path: '/farmer/contributions', icon: <FileText size={20} /> },
    { name: 'Orders Tracking', path: '/farmer/orders', icon: <Map size={20} /> },
    { name: 'Earnings & Payments', path: '/farmer/earnings', icon: <CreditCard size={20} /> },
    { name: 'Notifications', path: '/farmer/notifications', icon: <Bell size={20} /> },
    { name: 'Profile & Ratings', path: '/farmer/profile', icon: <User size={20} /> },
    { name: 'Support', path: '/farmer/support', icon: <HelpCircle size={20} /> },
  ];

  const pageTitle = navItems.find(item => location.pathname.includes(item.path))?.name || 'Dashboard';

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
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-200">
          <NavLink to="/" className="flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium text-neutral-600 hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut size={20} />
            <span>Logout</span>
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
            <h1 className="text-lg font-semibold tracking-tight">{pageTitle}</h1>
          </div>
          <div className="flex items-center space-x-4">
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
                    <span>{item.name}</span>
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
