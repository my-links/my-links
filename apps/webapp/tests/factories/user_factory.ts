import { DateTime } from 'luxon';

import User from '#models/user';
import OauthAuth from '#models/oauth_auth';
import PasswordAuth from '#models/password_auth';
import { AUTH_PROVIDER, type AuthProvider } from '#constants/auth';

const DEFAULT_EMAIL_PREFIX = 'user';
const DEFAULT_NAME = 'Test User';

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
	});
}

/**
 * Marks an existing user's address as confirmed. Accounts come out of
 * `createUser` unconfirmed, which is what a fresh registration looks like, so
 * the specs that need the other state say so explicitly.
 */
export async function verifyUserEmail(user: User): Promise<User> {
	user.emailVerifiedAt = DateTime.now();

	return user.save();
}

/**
 * Attaches a password to an existing user. The plain value is handed to the
 * model so the `beforeSave` hook does the hashing — a spec that pre-hashed the
 * value itself would stop covering that hook.
 */
export async function setUserPassword(
	user: User,
	plainPassword: string
): Promise<PasswordAuth> {
	return user.related('passwordAuth').create({ password: plainPassword });
}

/**
 * Marks an existing user as mid-grace-period. Defaults to "just requested",
 * but a spec covering the expiry sweep needs to place it in the past, hence
 * the optional override rather than always stamping `DateTime.now()`.
 */
export async function requestAccountDeletion(
	user: User,
	pendingDeletionAt: DateTime = DateTime.now()
): Promise<User> {
	user.pendingDeletionAt = pendingDeletionAt;

	return user.save();
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
