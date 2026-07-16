import { Exception } from '@adonisjs/core/exceptions';

export default class FaviconNotFoundException extends Exception {
	static status = 404;
	static code = 'E_FAVICON_NOT_FOUND';

	constructor(message: string) {
		super(message, { status: 404, code: 'E_FAVICON_NOT_FOUND' });
	}
}
