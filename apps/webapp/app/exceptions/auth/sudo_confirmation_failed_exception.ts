import { Exception } from '@adonisjs/core/exceptions';
import type { HttpContext } from '@adonisjs/core/http';

const STATUS = 403;
const CODE = 'E_SUDO_CONFIRMATION_FAILED';

/**
 * One wording for a wrong password and for a Google account that belongs to
 * somebody else. The person in front of the prompt already knows which of the
 * two they attempted; anyone else is being told nothing.
 */
const FAILED_MESSAGE = 'That did not confirm your identity';

/**
 * Renders itself the way the other authentication refusals do: the prompt is
 * shown again with one explanation, and no caller has to translate a rejection
 * into a form error.
 */
export default class SudoConfirmationFailedException extends Exception {
	static status = STATUS;
	static code = CODE;

	constructor() {
		super(FAILED_MESSAGE, { status: STATUS, code: CODE });
	}

	async handle(error: this, { session, response }: HttpContext) {
		session.flash('error', error.message);

		return response.redirectToNamedRoute('auth.sudo');
	}
}
