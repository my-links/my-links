import vine from '@vinejs/vine';

/**
 * No length or composition rule on the password: the sign-in form validates
 * that a value was typed, nothing more. Rejecting a short password here would
 * answer faster than a real attempt and describe the account policy to
 * someone who has no account.
 */
export const loginValidator = vine.create(
	vine.object({
		email: vine.string().trim().toLowerCase().email(),
		password: vine.string(),
	})
);
