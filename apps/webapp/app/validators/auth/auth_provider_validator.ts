import vine from '@vinejs/vine';

import { AUTH_PROVIDERS } from '#constants/auth';

/**
 * Names one of the providers this codebase knows how to talk to.
 *
 * Shared by everything that takes a provider from outside — the route
 * parameter of an unlink, the flags of the console commands — so callers read
 * an `AuthProvider` instead of narrowing an untyped bag, and a provider this
 * instance has never heard of is refused in one place. Whether the account
 * actually holds that link is the service's answer to give.
 */
export const authProviderValidator = vine.create(
	vine.object({
		provider: vine.enum(AUTH_PROVIDERS),
	})
);
