import { Exception } from '@adonisjs/core/exceptions';

export default class UnAuthorizedException extends Exception {
	static status = 401;
	static code = 'E_UNAUTHORIZED';

	constructor() {
		super('Unauthorized', { status: 401, code: 'E_UNAUTHORIZED' });
	}
}
