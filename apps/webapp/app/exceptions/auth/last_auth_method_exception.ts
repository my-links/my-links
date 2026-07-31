import { Exception } from '@adonisjs/core/exceptions';
import type { HttpContext } from '@adonisjs/core/http';

const STATUS = 409;
const CODE = 'E_LAST_AUTH_METHOD';

const REFUSED_MESSAGE =
	'This is the only way left to sign in to this account — add another one before removing it';

/**
 * Raised when detaching an authentication method would leave an account with
 * none, which is a locked-out account no support flow can reopen on a
 * self-hosted instance.
 *
 * The guard lives in the service rather than in the page that hides the
 * button: an interface can only decline to offer the action, and this has to
 * be impossible.
 */
export default class LastAuthMethodException extends Exception {
	static status = STATUS;
	static code = CODE;

	constructor() {
		super(REFUSED_MESSAGE, { status: STATUS, code: CODE });
	}

	async handle(error: this, { session, response }: HttpContext) {
		session.flash('error', error.message);

		return response.redirectToNamedRoute('user.settings');
	}
}
