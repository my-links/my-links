import { isSSREnableForPage } from '#config/ssr';
import { DEFAULT_USER_THEME, KEY_USER_THEME } from '#constants/user/theme';
import { UserAuthDto } from '#dtos/user_auth';
import env from '#start/env';
import logger from '@adonisjs/core/services/logger';
import { defineConfig } from '@adonisjs/inertia';
import type { InferSharedProps } from '@adonisjs/inertia/types';

const inertiaConfig = defineConfig({
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
		auth: async (ctx) =>
			ctx.inertia.always(async () => {
				await ctx.auth?.check();
				return new UserAuthDto(ctx.auth?.user).serialize();
			}),
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

export default inertiaConfig;

declare module '@adonisjs/inertia/types' {
	export interface SharedProps extends InferSharedProps<typeof inertiaConfig> {}
}
