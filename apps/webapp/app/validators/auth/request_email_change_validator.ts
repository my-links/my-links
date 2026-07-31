import vine from '@vinejs/vine';

/**
 * Normalized the way every other writer of `users.email` normalizes it, so two
 * spellings of the same address cannot become two accounts.
 *
 * No `unique` rule, for the reason registration has none: a validator that
 * rejected a taken address would answer which addresses have an account here.
 * Availability is settled by `EmailChangeService`, which answers the same way
 * either way.
 */
export const requestEmailChangeValidator = vine.create(
	vine.object({
		email: vine.string().trim().toLowerCase().email(),
	})
);
