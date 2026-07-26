import { Exception } from '@adonisjs/core/exceptions';

/**
 * Raised for every credentials failure — unknown email, missing password
 * method, wrong password. Carrying no reason is the point: a caller that
 * cannot tell the cases apart cannot leak them to the client either.
 */
export default class InvalidCredentialsException extends Exception {
	static status = 400;
	static code = 'E_INVALID_CREDENTIALS';

	constructor() {
		super('Invalid user credentials', {
			status: 400,
			code: 'E_INVALID_CREDENTIALS',
		});
	}
}
