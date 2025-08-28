import { Exception } from '@adonisjs/core/exceptions';

export default class UnAuthorizedException extends Exception {
	static status = 401;
	message = 'Missing or invalid authorization header';
	code = 'UNAUTHORIZED';
}
