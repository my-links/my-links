import { isSSREnableForPage } from '#config/ssr';
import {
	DARK_THEME_DEFAULT_VALUE,
	PREFER_DARK_THEME,
} from '#user/constants/theme';
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
		preferDarkTheme: (ctx) =>
			ctx.session?.get(PREFER_DARK_THEME, DARK_THEME_DEFAULT_VALUE),
		auth: async (ctx) => {
			await ctx.auth?.check();
			return {
				user: ctx.auth?.user || null,
				isAuthenticated: ctx.auth?.isAuthenticated || false,
			};
		},
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
