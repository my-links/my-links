import { Exception } from '@adonisjs/core/exceptions';
import type { HttpContext } from '@adonisjs/core/http';

const STATUS = 422;
const CODE = 'E_IMPORT_TOO_LARGE';

/**
 * Raised when an import file holds more collections or links than one import
 * may carry. Renders itself back onto the settings page like the other import
 * failures, since the person who picked the file is the one who can split it.
 */
export class ImportTooLargeException extends Exception {
	static status = STATUS;
	static code = CODE;

	constructor(message: string) {
		super(message, { status: STATUS, code: CODE });
	}

	async handle(error: this, { session, response }: HttpContext) {
		session.flash('error', error.message);

		return response.redirect().back();
	}
}
