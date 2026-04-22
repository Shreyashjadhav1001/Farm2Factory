import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { X, LogOut, Sprout } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Sidebar = ({ isOpen, onClose, navItems, onLogout }) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 w-72 bg-neutral-900 text-white flex flex-col z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header/Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-800 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sprout size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Farm2Factory</span>
          </Link>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const handleClick = () => {
              if (item.onClick) item.onClick();
              if (window.innerWidth < 768) onClose();
            };

            const content = (
              <>
                <span className="transition-colors duration-200">{item.icon}</span>
                <span className="text-sm">{item.name}</span>
              </>
            );

            const baseClasses = "flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium transition-all group w-full text-left";
            const activeClasses = "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25";
            const inactiveClasses = "text-neutral-400 hover:text-white hover:bg-neutral-800";

            if (item.onClick) {
              return (
                <button
                  key={item.name}
                  onClick={handleClick}
                  className={`${baseClasses} ${item.isActive ? activeClasses : inactiveClasses}`}
                >
                  {content}
                </button>
              );
            }

            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={handleClick}
                end={item.end}
                className={({ isActive }) =>
                  `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
                }
              >
                {content}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-neutral-800">
          <button
            onClick={onLogout}
            className="flex items-center gap-3.5 w-full px-4 py-3 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium text-sm"
          >
            <LogOut size={18} />
            <span>{t('nav.signOut')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
