import { Exception } from '@adonisjs/core/exceptions';
import type { HttpContext } from '@adonisjs/core/http';

const STATUS = 403;
const CODE = 'E_REGISTRATION_CLOSED';

const CLOSED_MESSAGE = 'This instance is not accepting new accounts';

/**
 * Renders itself the way the other authentication refusals do, so neither the
 * form nor the page behind it has to know the policy: a closed instance sends
 * the visitor home with one explanation, whichever of the two they reached.
 */
export default class RegistrationClosedException extends Exception {
	static status = STATUS;
	static code = CODE;

	constructor() {
		super(CLOSED_MESSAGE, { status: STATUS, code: CODE });
	}

	async handle(error: this, { session, response }: HttpContext) {
		session.flash('error', error.message);

		return response.redirectToNamedRoute('home');
	}
}
