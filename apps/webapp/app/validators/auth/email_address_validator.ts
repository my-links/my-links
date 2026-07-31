import vine from '@vinejs/vine';

/**
 * The address alone, normalized exactly the way the registration validator
 * normalizes it, so the lookup behind these forms sees the address the account
 * was stored under.
 *
 * Shared by the two flows that mail a link to a typed address — asking for a
 * password reset and asking for a fresh confirmation link. Neither carries an
 * `exists` rule: a validator that rejected an unknown address would answer the
 * very question both flows are built to refuse.
 */
export const emailAddressValidator = vine.create(
	vine.object({
		email: vine.string().trim().toLowerCase().email(),
	})
);
