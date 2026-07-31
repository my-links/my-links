import vine from '@vinejs/vine';

import { ACCOUNT_ROLES } from '#constants/account';

/**
 * The role an account is being moved to. Validated at the boundary so the
 * caller reads an `AccountRole` instead of narrowing a raw string; whether the
 * instance can afford the move — demoting its last administrator — is
 * `UserService`'s answer to give.
 */
export const accountRoleValidator = vine.create(
	vine.object({
		role: vine.enum(ACCOUNT_ROLES),
	})
);
