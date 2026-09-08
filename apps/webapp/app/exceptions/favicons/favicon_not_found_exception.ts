import { Exception } from '@adonisjs/core/exceptions';
import type { HttpContext } from '@adonisjs/core/http';

const REFRESH_FAILED_MESSAGE = 'No favicon could be found for that link';

export default class FaviconNotFoundException extends Exception {
	static status = 404;
	static code = 'E_FAVICON_NOT_FOUND';

	constructor(message: string) {
		super(message, { status: 404, code: 'E_FAVICON_NOT_FOUND' });
	}

	/**
	 * Only reached from a user-triggered refresh — the background resolution
	 * path always swallows this exception itself. Flashes back onto the page
	 * rather than the generic 404 page, since the link this failed for is
	 * still perfectly valid.
	 */
	async handle(_error: this, { session, response }: HttpContext) {
		session.flash('error', REFRESH_FAILED_MESSAGE);
		return response.redirect().back();
	}
}
