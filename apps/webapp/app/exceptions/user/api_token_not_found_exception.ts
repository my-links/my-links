import { Exception } from '@adonisjs/core/exceptions';
import type { HttpContext } from '@adonisjs/core/http';

const STATUS = 404;
const CODE = 'E_API_TOKEN_NOT_FOUND';
const NOT_FOUND_MESSAGE = 'This API token no longer exists';

/**
 * Raised when a revocation targets a token the account does not own — a stale
 * settings page, or someone else's identifier. Renders itself back onto the
 * page the request came from: an empty 404 body told a browser nothing.
 */
export default class ApiTokenNotFoundException extends Exception {
	static status = STATUS;
	static code = CODE;

	constructor() {
		super(NOT_FOUND_MESSAGE, { status: STATUS, code: CODE });
	}

	async handle(error: this, { session, response }: HttpContext) {
		session.flash('error', error.message);

		return response.redirect().withQs().back();
	}
}
