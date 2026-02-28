import { i18n } from '@lingui/core';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '~/consts/i18n';
import type { Locale } from '~/types/i18n';

/**
 * We do a dynamic import of just the catalog that we need
 * @param locale any locale string
 */
export async function dynamicActivate(locale: Locale) {
	const { messages } = await import(`../locales/${locale}/messages.po`);
	i18n.loadAndActivate({ locale, messages });
}

/**
 * Persist the chosen locale for later visits in cookie
 */
export function persistLocale(locale: Locale) {
	try {
		document.cookie = `locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`;
	} catch {}
}

/**
 * Read persisted locale from cookie
 */
export function readPersistedLocale(): Locale | null {
	try {
		const match = document.cookie.match(/(?:^|; )locale=([^;]+)/);
		const value = match ? decodeURIComponent(match[1]) : null;
		if (value && value in SUPPORTED_LOCALES) return value as Locale;
	} catch {}
	return null;
}

/**
 * Detect browser locale and map to supported locales
 */
export function detectBrowserLocale(): Locale | null {
	if (typeof navigator === 'undefined') return null;
	const candidates: string[] = [];
	const nav = navigator as Navigator & { userLanguage?: string };
	if (Array.isArray(nav.languages)) candidates.push(...nav.languages);
	if (nav.language) candidates.push(nav.language);
	if (nav.userLanguage) candidates.push(nav.userLanguage);

	for (const code of candidates) {
		const normalized = code.toLowerCase();
		const base = normalized.split('-')[0] as keyof typeof SUPPORTED_LOCALES;
		if (base in SUPPORTED_LOCALES) return base as Locale;
	}
	return null;
}

/**
 * Get initial locale using persistence, then detection, then default
 */
export function resolveInitialLocale(): Locale {
	return readPersistedLocale() ?? detectBrowserLocale() ?? DEFAULT_LOCALE;
}
