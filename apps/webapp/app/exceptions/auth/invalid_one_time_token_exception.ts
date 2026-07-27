import { Exception } from '@adonisjs/core/exceptions';
import type { HttpContext } from '@adonisjs/core/http';

const STATUS = 400;
const CODE = 'E_INVALID_ONE_TIME_TOKEN';

/**
 * One wording for a link that never existed, one that expired and one that was
 * already used. Telling them apart would confirm to whoever holds a stolen
 * link which of the three it is, and none of the three leaves the recipient
 * anything to do differently: ask for a new link.
 */
const INVALID_TOKEN_MESSAGE = 'This link is no longer valid';

export default class InvalidOneTimeTokenException extends Exception {
	static status = STATUS;
	static code = CODE;

	constructor() {
		super(INVALID_TOKEN_MESSAGE, { status: STATUS, code: CODE });
	}

	async handle(error: this, { session, response }: HttpContext) {
		session.flash('error', error.message);

		return response.redirectToNamedRoute('home');
	}
}
