import { Exception } from '@adonisjs/core/exceptions';
import type { HttpContext } from '@adonisjs/core/http';

const STATUS = 403;
const CODE = 'E_ADMIN_ACCESS_REQUIRED';
const REFUSED_MESSAGE = 'This area is reserved to administrators';

/**
 * Raised when a signed-in account without the admin flag reaches an admin
 * route. Renders as a redirect rather than a 403 page: the person is
 * legitimately signed in, so their collections are a better landing place than
 * an error — but they are told why they were moved.
 */
export default class AdminAccessRequiredException extends Exception {
	static status = STATUS;
	static code = CODE;

	constructor() {
		super(REFUSED_MESSAGE, { status: STATUS, code: CODE });
	}

	async handle(error: this, { session, response }: HttpContext) {
		session.flash('error', error.message);

		return response.redirectToNamedRoute('collection.favorites');
	}
}
