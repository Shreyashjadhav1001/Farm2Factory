import React, { useState, useContext, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';

const languages = [
  { code: 'en', name: 'English',  native: 'English' },
  { code: 'hi', name: 'Hindi',    native: 'हिन्दी' },
  { code: 'mr', name: 'Marathi',  native: 'मराठी' },
  { code: 'kn', name: 'Kannada',  native: 'ಕನ್ನಡ' },
  { code: 'te', name: 'Telugu',   native: 'తెలుగు' },
  { code: 'ta', name: 'Tamil',    native: 'தமிழ்' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi',  native: 'ਪੰਜਾਬੀ' },
  { code: 'bn', name: 'Bengali',  native: 'বাংলা' },
  { code: 'or', name: 'Odia',     native: 'ଓଡ଼ିଆ' },
];

const LanguageSwitcher = () => {
  const { currentLang, setCurrentLang } = useContext(LanguageContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedLang = languages.find(l => l.code === currentLang) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLangChange = (code) => {
    setCurrentLang(code); // This now also calls i18n.changeLanguage() via context
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="language-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200 text-sm font-medium"
      >
        <Globe size={18} className="text-emerald-500" />
        <span className="hidden sm:inline font-semibold">{selectedLang.native}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-xl bg-slate-900 border border-white/10 shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="py-1 max-h-80 overflow-y-auto">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLangChange(lang.code)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors duration-150 ${
                  currentLang === lang.code
                    ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{lang.native}</span>
                <span className="text-xs text-slate-500 ml-2">{lang.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
