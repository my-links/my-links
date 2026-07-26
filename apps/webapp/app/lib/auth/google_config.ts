import IncompleteGoogleAuthConfigException from '#exceptions/auth/incomplete_google_auth_config_exception';

export type GoogleAuthConfig =
	| {
			readonly isEnabled: true;
			readonly clientId: string;
			readonly clientSecret: string;
	  }
	| { readonly isEnabled: false };

/**
 * Resolves the Google OAuth credentials into an explicit enabled/disabled
 * state. Both credentials present enables the provider, both absent disables
 * it, and anything in between throws rather than silently degrading — a
 * half-configured provider is an operator mistake, not a valid state.
 */
export function resolveGoogleAuthConfig(
	clientId: string | undefined,
	clientSecret: string | undefined
): GoogleAuthConfig {
	if (!clientId && !clientSecret) {
		return { isEnabled: false };
	}

	if (!clientId) {
		throw new IncompleteGoogleAuthConfigException('GOOGLE_CLIENT_ID');
	}

	if (!clientSecret) {
		throw new IncompleteGoogleAuthConfigException('GOOGLE_CLIENT_SECRET');
	}

	return { isEnabled: true, clientId, clientSecret };
}
