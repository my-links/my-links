import { isSSREnableForPage } from '#config/ssr';
import type { HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import { defineConfig } from '@adonisjs/inertia';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '../inertia/consts/i18n.js';

export function resolveServerLocale(ctx: HttpContext): string {
	const plainCookie = ctx.request.plainCookie('locale', { encoded: false });
	const cookie = ctx.request.cookie('locale');
	const localeCookie = plainCookie ?? cookie;

	if (localeCookie) {
		logger.debug(`Locale cookie found: ${localeCookie}`);
	} else {
		logger.debug('No locale cookie found in request');
	}

	if (localeCookie && SUPPORTED_LOCALES.includes(localeCookie)) {
		return localeCookie;
	}

	const acceptLanguage = ctx.request.header('accept-language');
	if (acceptLanguage) {
		const languages = acceptLanguage
			.split(',')
			.map((lang: string) => lang.split(';')[0].trim().toLowerCase());
		for (const lang of languages) {
			const base = lang.split('-')[0];
			if (SUPPORTED_LOCALES.includes(base as any)) {
				logger.debug(`Locale from Accept-Language: ${base}`);
				return base;
			}
		}
	}

	logger.debug(`Using default locale: ${DEFAULT_LOCALE}`);
	return DEFAULT_LOCALE;
}

const inertiaConfig = defineConfig({
	rootView: 'inertia_layout',
	ssr: {
		enabled: true,
		pages: (_, page) => {
			const ssrEnabled = isSSREnableForPage(page);
			logger.debug(`Page "${page}" SSR enabled: ${ssrEnabled}`);
			return ssrEnabled;
		},
	},
});

export default inertiaConfig;
