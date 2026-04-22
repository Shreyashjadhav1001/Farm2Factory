import React, { createContext, useState, useEffect } from 'react';
import i18n, { STORAGE_KEY } from '../i18n';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLangState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'en';
  });

  // Central function: updates state, localStorage, AND i18next simultaneously
  const setCurrentLang = (lang) => {
    setCurrentLangState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    i18n.changeLanguage(lang);
  };

  // On mount, ensure i18next is synced with whatever was stored
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) || 'en';
    i18n.changeLanguage(stored);
  }, []);

  return (
    <LanguageContext.Provider value={{ currentLang, setCurrentLang }}>
      {children}
    </LanguageContext.Provider>
  );
};
