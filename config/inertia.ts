import { isSSREnableForPage } from '#config/ssr';
import env from '#start/env';
import { DEFAULT_USER_THEME, KEY_USER_THEME } from '#user/constants/theme';
import logger from '@adonisjs/core/services/logger';
import { defineConfig } from '@adonisjs/inertia';

export default defineConfig({
	/**
	 * Path to the Edge view that will be used as the root view for Inertia responses
	 */
	rootView: 'inertia_layout',

	/**
	 * Data that should be shared with all rendered pages
	 */
	sharedData: {
		errors: (ctx) => ctx.session?.flashMessages.get('errors'),
		token: (ctx) => ctx.session?.flashMessages.get('token'),
		user: (ctx) => ({
			theme: ctx.session?.get(KEY_USER_THEME, DEFAULT_USER_THEME),
		}),
		auth: async (ctx) => {
			await ctx.auth?.check();
			return {
				user: ctx.auth?.user || null,
				isAuthenticated: ctx.auth?.isAuthenticated || false,
			};
		},
		appUrl: env.get('APP_URL'),
	},

	/**
	 * Options for the server-side rendering
	 */
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
