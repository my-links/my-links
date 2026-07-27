import vine from '@vinejs/vine';

/**
 * Normalized exactly the way the registration validator normalizes it, so the
 * lookup behind this form sees the same address the account was stored under.
 *
 * No `exists` rule: a validator that rejected an unknown address would answer
 * the one question this whole flow is built to refuse.
 */
export const requestPasswordResetValidator = vine.create(
	vine.object({
		email: vine.string().trim().toLowerCase().email(),
	})
);
