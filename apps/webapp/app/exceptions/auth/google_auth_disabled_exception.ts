import { Exception } from '@adonisjs/core/exceptions';

export default class GoogleAuthDisabledException extends Exception {
	static status = 404;
	static code = 'E_GOOGLE_AUTH_DISABLED';

	constructor() {
		super('Google authentication is not enabled on this instance', {
			status: 404,
			code: 'E_GOOGLE_AUTH_DISABLED',
		});
	}
}
