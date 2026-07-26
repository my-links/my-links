import { defineConfig, services } from '@adonisjs/ally';

import env from '#start/env';
import { resolveGoogleAuthConfig } from '#lib/auth/google_config';

/**
 * Resolved at boot so a partial configuration crashes the app immediately
 * rather than at the first sign-in attempt.
 */
const googleAuthConfig = resolveGoogleAuthConfig(
	env.get('GOOGLE_CLIENT_ID'),
	env.get('GOOGLE_CLIENT_SECRET')
);

/**
 * The provider stays registered even when disabled, so route registration and
 * the generated Tuyau registry keep a stable shape across configurations. The
 * routes are gated by `GoogleAuthConfigService` and return 404 when disabled,
 * so these blank credentials are never reachable.
 */
const allyConfig = defineConfig({
	google: services.google({
		clientId: googleAuthConfig.isEnabled ? googleAuthConfig.clientId : '',
		clientSecret: googleAuthConfig.isEnabled
			? googleAuthConfig.clientSecret
			: '',
		callbackUrl: env.get('APP_URL') + '/auth/callback',
		prompt: 'select_account',
		display: 'page',
		scopes: ['userinfo.email', 'userinfo.profile'],
	}),
});

export default allyConfig;

declare module '@adonisjs/ally/types' {
	interface SocialProviders extends InferSocialProviders<typeof allyConfig> {}
}
