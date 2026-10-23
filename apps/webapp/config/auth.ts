import { defineConfig } from '@adonisjs/auth';
import { tokensGuard, tokensUserProvider } from '@adonisjs/auth/access_tokens';
import { sessionGuard, sessionUserProvider } from '@adonisjs/auth/session';
import type { Authenticators, InferAuthEvents } from '@adonisjs/auth/types';

const authConfig = defineConfig({
	default: 'web',
	guards: {
		web: sessionGuard({
			useRememberMeTokens: false,
			provider: sessionUserProvider({
				model: () => import('#models/user'),
			}),
		}),
		api: tokensGuard({
			provider: tokensUserProvider({
				tokens: 'accessTokens',
				model: () => import('#models/user'),
			}),
		}),
	},
});

export default authConfig;

/**
 * Inferring types from the configured auth
 * guards.
 */
declare module '@adonisjs/auth/types' {
	interface Authenticators extends InferAuthenticators<typeof authConfig> {}
}
declare module '@adonisjs/core/types' {
	interface EventsList extends InferAuthEvents<Authenticators> {}
}
