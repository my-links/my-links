import vine from '@vinejs/vine';

/**
 * No length rule, for the same reason the sign-in form has none: this checks a
 * password that already exists, and rejecting a short one before verifying it
 * would answer faster than a real attempt.
 */
export const sudoConfirmationValidator = vine.create(
	vine.object({
		password: vine.string(),
	})
);
