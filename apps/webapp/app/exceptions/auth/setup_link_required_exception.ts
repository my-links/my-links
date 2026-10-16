import { Exception } from '@adonisjs/core/exceptions';
import type { HttpContext } from '@adonisjs/core/http';

const STATUS = 403;
const CODE = 'E_SETUP_LINK_REQUIRED';

export const SETUP_LINK_REQUIRED_MESSAGE =
	'Registration on this instance needs the setup link from the server logs, or `node ace user:create --admin`';

/**
 * Raised while a fresh instance still waits for its first administrator: no
 * stranger may claim the sign-up window the owner is about to use.
 */
export class SetupLinkRequiredException extends Exception {
	static status = STATUS;
	static code = CODE;

	constructor() {
		super(SETUP_LINK_REQUIRED_MESSAGE, { status: STATUS, code: CODE });
	}

	async handle(error: this, { session, response }: HttpContext) {
		session.flash('error', error.message);

		return response.redirectToNamedRoute('auth.login');
	}
}
