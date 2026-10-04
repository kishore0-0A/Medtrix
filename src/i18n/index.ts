import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en/translation.json';
import ta from './locales/ta/translation.json';
import hi from './locales/hi/translation.json';

const LANGUAGE_KEY = 'app_language';

const resources = {
  en: { translation: en },
  ta: { translation: ta },
  hi: { translation: hi },
};

export const initI18n = async () => {
  if (i18n.isInitialized) return;
  const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
  const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';
  
  const initialLang = savedLanguage || (resources[deviceLanguage as keyof typeof resources] ? deviceLanguage : 'en');

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLang,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false, 
      },
      compatibilityJSON: 'v4',
    });
};

export const changeLanguage = async (lng: string) => {
  await AsyncStorage.setItem(LANGUAGE_KEY, lng);
  return i18n.changeLanguage(lng);
};

export default i18n;
