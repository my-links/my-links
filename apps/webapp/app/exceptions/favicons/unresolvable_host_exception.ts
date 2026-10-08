import { Exception } from '@adonisjs/core/exceptions';
import type { HttpContext } from '@adonisjs/core/http';

const REFRESH_UNRESOLVABLE_MESSAGE = "That link's address can't be resolved";

export class UnresolvableHostException extends Exception {
	static status = 404;
	static code = 'E_UNRESOLVABLE_HOST';

	constructor(message: string) {
		super(message, { status: 404, code: 'E_UNRESOLVABLE_HOST' });
	}

	/** Same rationale as `FaviconNotFoundException.handle`: only a user-triggered refresh reaches this uncaught. */
	async handle(_error: this, { session, response }: HttpContext) {
		session.flash('error', REFRESH_UNRESOLVABLE_MESSAGE);
		return response.redirect().back();
	}
}
