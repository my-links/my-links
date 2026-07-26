import { Exception } from '@adonisjs/core/exceptions';
import type { HttpContext } from '@adonisjs/core/http';

const STATUS = 400;
const CODE = 'E_INVALID_IMPORT_FILE';

/**
 * Raised once the upload passed validation but its contents still cannot be
 * used. Renders itself back onto the settings page, since the person who
 * picked the file is the only one who can fix it.
 */
export default class InvalidImportFileException extends Exception {
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
