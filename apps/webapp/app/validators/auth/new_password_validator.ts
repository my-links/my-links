import vine from '@vinejs/vine';

import { newPasswordSchema } from '#validators/auth/password_rules';

/**
 * The body of every form that chooses a password for an account that is
 * already identified — by a session for setting and changing one, by a
 * single-use link for resetting one. None of the three carries an email or a
 * current password: who the account is has been settled before this runs.
 */
export const newPasswordValidator = vine.create(
	vine.object({
		password: newPasswordSchema(),
	})
);
