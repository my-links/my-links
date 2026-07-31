import type User from '#models/user';
import { PASSWORD_AUTH_METHOD, type AuthMethod } from '#constants/auth';

/**
 * Every way an account can prove itself, read off the relations the caller
 * preloaded.
 *
 * Pure on purpose: the admin dashboard states this for every account it lists,
 * so asking the database again per row is the round trip the preload exists to
 * avoid. An account whose relations were never loaded reads as having no
 * method at all — the caller that forgot the preload is the one to fix.
 */
export function listAuthMethods(user: User): AuthMethod[] {
	const providers = user.oauthAuths?.map((oauthAuth) => oauthAuth.provider);
	const linkedProviders = providers ?? [];

	if (!user.passwordAuth) return linkedProviders;

	return [PASSWORD_AUTH_METHOD, ...linkedProviders];
}
