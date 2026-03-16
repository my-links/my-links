import { Exception } from '@adonisjs/core/exceptions';

export default class UrlBlockedException extends Exception {
	static status = 403;
	static code = 'E_URL_BLOCKED';

	constructor(message: string) {
		super(message, { status: 403, code: 'E_URL_BLOCKED' });
	}
}
