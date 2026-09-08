import { Exception } from '@adonisjs/core/exceptions';
import type { HttpContext } from '@adonisjs/core/http';

const REFRESH_BLOCKED_MESSAGE = "That link's address can't be resolved";

export default class UrlBlockedException extends Exception {
	static status = 403;
	static code = 'E_URL_BLOCKED';

	constructor(message: string) {
		super(message, { status: 403, code: 'E_URL_BLOCKED' });
	}

	/** Same rationale as `FaviconNotFoundException.handle` — only a user-triggered refresh reaches this uncaught. */
	async handle(_error: this, { session, response }: HttpContext) {
		session.flash('error', REFRESH_BLOCKED_MESSAGE);
		return response.redirect().back();
	}
}
