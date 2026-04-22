import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all locale JSONs statically for best performance (no network latency)
import enTranslation from './locales/en/translation.json';
import hiTranslation from './locales/hi/translation.json';
import mrTranslation from './locales/mr/translation.json';
import knTranslation from './locales/kn/translation.json';
import teTranslation from './locales/te/translation.json';
import taTranslation from './locales/ta/translation.json';
import guTranslation from './locales/gu/translation.json';
import paTranslation from './locales/pa/translation.json';
import bnTranslation from './locales/bn/translation.json';
import orTranslation from './locales/or/translation.json';

const STORAGE_KEY = 'app_language';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      hi: { translation: hiTranslation },
      mr: { translation: mrTranslation },
      kn: { translation: knTranslation },
      te: { translation: teTranslation },
      ta: { translation: taTranslation },
      gu: { translation: guTranslation },
      pa: { translation: paTranslation },
      bn: { translation: bnTranslation },
      or: { translation: orTranslation },
    },
    // Read persisted language from localStorage
    lng: localStorage.getItem(STORAGE_KEY) || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already protects against XSS
    },
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: STORAGE_KEY,
      caches: ['localStorage'],
    },
  });

export { STORAGE_KEY };
export default i18n;
