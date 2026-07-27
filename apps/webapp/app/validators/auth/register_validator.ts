import vine from '@vinejs/vine';

import { newPasswordSchema } from '#validators/auth/password_rules';

const MINIMUM_NAME_LENGTH = 2;
const MAXIMUM_NAME_LENGTH = 255;

/**
 * Deliberately no `unique` rule on the email: a validator that rejects a taken
 * address turns the form into a list of who has an account here. Availability
 * is settled by `RegistrationService`, which answers the same way either way.
 */
export const registerValidator = vine.create(
	vine.object({
		name: vine
			.string()
			.trim()
			.minLength(MINIMUM_NAME_LENGTH)
			.maxLength(MAXIMUM_NAME_LENGTH),
		email: vine.string().trim().toLowerCase().email(),
		password: newPasswordSchema(),
	})
);
