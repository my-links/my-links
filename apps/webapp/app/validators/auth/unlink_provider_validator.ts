import vine from '@vinejs/vine';

import { AUTH_PROVIDERS } from '#constants/auth';

/**
 * The route parameter naming the provider to detach. Validated at the boundary
 * so the service reads an `AuthProvider` instead of narrowing an untyped params
 * bag; whether the account actually holds that link is the service's answer to
 * give.
 */
export const unlinkProviderValidator = vine.create(
	vine.object({
		provider: vine.enum(AUTH_PROVIDERS),
	})
);
