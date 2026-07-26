import { DateTime } from 'luxon';

import User from '#models/user';
import OauthAuth from '#models/oauth_auth';
import { AUTH_PROVIDER, type AuthProvider } from '#constants/auth';

const DEFAULT_EMAIL_PREFIX = 'user';
const DEFAULT_NAME = 'Test User';
const DEFAULT_AVATAR_URL = 'https://example.com/avatar.png';

let userCounter = 0;

type UserAttributes = {
	readonly emailPrefix?: string;
	readonly name?: string;
};

/**
 * Builds a persisted user with a unique email. Every functional suite needs one
 * and none of them cares about the identity columns, so the shape lives here
 * instead of being copied into each spec.
 */
export async function createUser({
	emailPrefix = DEFAULT_EMAIL_PREFIX,
	name = DEFAULT_NAME,
}: UserAttributes = {}): Promise<User> {
	userCounter += 1;

	return User.create({
		email: `${emailPrefix}-${Date.now()}-${userCounter}@example.com`,
		name,
		avatarUrl: DEFAULT_AVATAR_URL,
	});
}

export async function linkOauthIdentity(
	user: User,
	providerUserId: string,
	provider: AuthProvider = AUTH_PROVIDER.GOOGLE
): Promise<OauthAuth> {
	return OauthAuth.create({
		userId: user.id,
		provider,
		providerUserId,
		linkedAt: DateTime.now(),
	});
}
