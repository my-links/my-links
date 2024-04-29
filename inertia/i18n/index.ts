import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// TODO: Refacot this stuff
// /!\ Code completion has to keep working

import frResourceAbout from './locales/fr/about.json';
import frResourceAdmin from './locales/fr/admin.json';
import frResourceCommon from './locales/fr/common.json';
import frResourceHome from './locales/fr/home.json';
import frResourceLogin from './locales/fr/login.json';
import frResourcePrivacy from './locales/fr/privacy.json';
import frResourceTerms from './locales/fr/terms.json';

import enResourceAbout from './locales/en/about.json';
import enResourceAdmin from './locales/en/admin.json';
import enResourceCommon from './locales/en/common.json';
import enResourceHome from './locales/en/home.json';
import enResourceLogin from './locales/en/login.json';
import enResourcePrivacy from './locales/en/privacy.json';
import enResourceTerms from './locales/en/terms.json';

type I18nFR =
  | RemoveSuffix<Leaves<typeof frResourceAbout>>
  | RemoveSuffix<Leaves<typeof frResourceAdmin>>
  | RemoveSuffix<Leaves<typeof frResourceCommon>>
  | RemoveSuffix<Leaves<typeof frResourceHome>>
  | RemoveSuffix<Leaves<typeof frResourceLogin>>
  | RemoveSuffix<Leaves<typeof frResourcePrivacy>>
  | RemoveSuffix<Leaves<typeof frResourceTerms>>;
export type I18nKey = I18nFR;

export const resources = {
  en: {
    about: enResourceAbout,
    admin: enResourceAdmin,
    common: enResourceCommon,
    home: enResourceHome,
    login: enResourceLogin,
    privacy: enResourcePrivacy,
    terms: enResourceTerms,
  },
  fr: {
    about: frResourceAbout,
    admin: frResourceAdmin,
    common: frResourceCommon,
    home: frResourceHome,
    login: frResourceLogin,
    privacy: frResourcePrivacy,
    terms: frResourceTerms,
  },
} as const;

i18n.use(initReactI18next).init({
  returnNull: false,
  resources,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  defaultNS: 'common',
});

export default i18n;
