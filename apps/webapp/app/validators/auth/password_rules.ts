import vine from '@vinejs/vine';

/**
 * Length is the only password rule. Composition rules ("one digit, one
 * symbol") shrink the search space an attacker has to walk and push people
 * towards `Password1!`, so twelve characters of anything is the better trade.
 *
 * Exported because the forms have to state the rule they will be judged by,
 * and a second copy of the number in a page would eventually disagree with
 * this one.
 */
export const MINIMUM_PASSWORD_LENGTH = 12;

/**
 * A cap is needed because every submitted value is hashed, and argon2 will
 * happily spend its memory budget on a megabyte of input.
 */
const MAXIMUM_PASSWORD_LENGTH = 256;

const CONFIRMATION_FIELD = 'passwordConfirmation';

/**
 * Shared by every form that chooses a new password — registration, setting a
 * first one, changing one, resetting one. Four copies of the same three rules
 * is four chances for one of them to drift.
 */
export function newPasswordSchema() {
	return vine
		.string()
		.minLength(MINIMUM_PASSWORD_LENGTH)
		.maxLength(MAXIMUM_PASSWORD_LENGTH)
		.confirmed({ confirmationField: CONFIRMATION_FIELD });
}
