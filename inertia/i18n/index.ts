import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// TODO: Refacot this stuff
// /!\ Code completion has to keep working

import frResourceAbout from './locales/fr/about.json';
import frResourceAdmin from './locales/fr/admin.json';
import frResourceCommon from './locales/fr/common.json';
import frResourceHome from './locales/fr/home.json';

import frResourceLegal from './locales/fr/legal.json';
import frResourcePrivacy from './locales/fr/privacy.json';
import frResourceTerms from './locales/fr/terms.json';

import { LS_LANG_KEY } from '~/constants';
import enResourceAbout from './locales/en/about.json';
import enResourceAdmin from './locales/en/admin.json';
import enResourceCommon from './locales/en/common.json';
import enResourceHome from './locales/en/home.json';

import enResourceLegal from './locales/en/legal.json';
import enResourcePrivacy from './locales/en/privacy.json';
import enResourceTerms from './locales/en/terms.json';

type I18nFR =
	| RemoveSuffix<Leaves<typeof frResourceAbout>>
	| RemoveSuffix<Leaves<typeof frResourceAdmin>>
	| RemoveSuffix<Leaves<typeof frResourceCommon>>
	| RemoveSuffix<Leaves<typeof frResourceHome>>
	| RemoveSuffix<Leaves<typeof frResourcePrivacy>>
	| RemoveSuffix<Leaves<typeof frResourceTerms>>
	| RemoveSuffix<Leaves<typeof frResourceLegal>>;
export type I18nKey = I18nFR;

export const resources = {
	en: {
		about: enResourceAbout,
		admin: enResourceAdmin,
		common: enResourceCommon,
		home: enResourceHome,
		privacy: enResourcePrivacy,
		terms: enResourceTerms,
		legal: enResourceLegal,
	},
	fr: {
		about: frResourceAbout,
		admin: frResourceAdmin,
		common: frResourceCommon,
		home: frResourceHome,
		privacy: frResourcePrivacy,
		terms: frResourceTerms,
		legal: frResourceLegal,
	},
} as const;

export const languages = ['en', 'fr'] as const;

const lng =
	typeof window !== 'undefined'
		? localStorage.getItem(LS_LANG_KEY) || undefined
		: undefined;
i18n.use(initReactI18next).init({
	returnNull: false,
	resources,
	lng,
	fallbackLng: 'en',
	interpolation: {
		escapeValue: false,
	},
	defaultNS: 'common',
});

export default i18n;
