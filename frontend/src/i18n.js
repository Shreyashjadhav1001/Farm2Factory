import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all locale JSONs
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
    lng: localStorage.getItem('f2f_language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: 'f2f_language',
      caches: ['localStorage'],
    },
  });

export default i18n;
