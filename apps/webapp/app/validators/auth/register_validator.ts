import vine from '@vinejs/vine';

const MINIMUM_NAME_LENGTH = 2;
const MAXIMUM_NAME_LENGTH = 255;

/**
 * Length is the only password rule. Composition rules ("one digit, one
 * symbol") shrink the search space an attacker has to walk and push people
 * towards `Password1!`, so twelve characters of anything is the better trade.
 *
 * Exported because the form has to state the rule it will be judged by, and a
 * second copy of the number in the page would eventually disagree with this
 * one.
 */
export const MINIMUM_PASSWORD_LENGTH = 12;

/**
 * A cap is needed because every submitted value is hashed, and argon2 will
 * happily spend its memory budget on a megabyte of input.
 */
const MAXIMUM_PASSWORD_LENGTH = 256;

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
		password: vine
			.string()
			.minLength(MINIMUM_PASSWORD_LENGTH)
			.maxLength(MAXIMUM_PASSWORD_LENGTH)
			.confirmed({ confirmationField: 'passwordConfirmation' }),
	})
);
