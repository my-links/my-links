import { isSSREnableForPage } from '#config/ssr';
import { UserAuthDto } from '#dtos/user_auth';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '#shared/consts/i18n';
import env from '#start/env';
import { HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import { defineConfig } from '@adonisjs/inertia';
import type { InferSharedProps } from '@adonisjs/inertia/types';

function resolveServerLocale(ctx: HttpContext): string {
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
	sharedData: {
		errors: (ctx) => ctx.session?.flashMessages.get('errors'),
		token: (ctx) => ctx.session?.flashMessages.get('token'),
		auth: (ctx) =>
			ctx.inertia.always(async () => {
				await ctx.auth?.check();
				return new UserAuthDto(ctx.auth?.user).serialize();
			}),
		appUrl: env.get('APP_URL'),
		locale: (ctx) => resolveServerLocale(ctx),
	},
	ssr: {
		enabled: true,
		entrypoint: 'inertia/app/ssr.tsx',
		pages: (_, page) => {
			const ssrEnabled = isSSREnableForPage(page);
			logger.debug(`Page "${page}" SSR enabled: ${ssrEnabled}`);
			return ssrEnabled;
		},
	},
});

export default inertiaConfig;

declare module '@adonisjs/inertia/types' {
	export interface SharedProps extends InferSharedProps<typeof inertiaConfig> {}
}
