import React, { createContext, useState, useEffect } from 'react';
import i18n from '../i18n';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('f2f_language') || 'en';
  });

  const handleLangChange = (lang) => {
    setCurrentLang(lang);
    localStorage.setItem('f2f_language', lang);
    i18n.changeLanguage(lang); // Sync i18next immediately
  };

  // Sync i18next on mount in case localStorage had a saved language
  useEffect(() => {
    i18n.changeLanguage(currentLang);
  }, []);

  return (
    <LanguageContext.Provider value={{ currentLang, setCurrentLang: handleLangChange }}>
      {children}
    </LanguageContext.Provider>
  );
};
