import { defineConfig } from '@adonisjs/auth';
import { sessionGuard, sessionUserProvider } from '@adonisjs/auth/session';
import { Authenticators, InferAuthEvents } from '@adonisjs/auth/types';

const authConfig = defineConfig({
	default: 'web',
	guards: {
		web: sessionGuard({
			useRememberMeTokens: false,
			provider: sessionUserProvider({
				model: () => import('#user/models/user'),
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
