import React from 'react';
import { Menu, Bell, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const Navbar = ({ onMenuClick, user }) => {
  const { t } = useTranslation();

  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 sm:px-6 z-30 sticky top-0 w-full transition-all duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-neutral-500 hover:bg-neutral-50 rounded-lg transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </button>

        <div className="hidden md:block">
          <h1 className="text-lg font-bold text-neutral-900 truncate max-w-[200px] md:max-w-md">
            {user?.name || t('navbar.dashboard')}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <LanguageSwitcher />

        {user?.kycStatus && (
          <div className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
            user.kycStatus === 'verified'
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
              : 'bg-amber-50 text-amber-600 border-amber-100'
          }`}>
            {user.kycStatus === 'verified' && <CheckCircle size={12} />}
            <span>
              {user.kycStatus === 'verified' ? t('navbar.verifiedKyc') : t('navbar.pendingKyc')}
            </span>
          </div>
        )}

        <button className="relative p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-all">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-neutral-900 truncate max-w-[80px]">
              {user?.name || 'User'}
            </p>
            <p className="text-[10px] text-neutral-500 capitalize">{user?.role || 'Member'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
