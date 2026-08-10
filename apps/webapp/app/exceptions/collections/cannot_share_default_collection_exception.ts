import { Exception } from '@adonisjs/core/exceptions';

export default class CannotShareDefaultCollectionException extends Exception {
	static status = 400;
	static code = 'E_CANNOT_SHARE_DEFAULT_COLLECTION';

	constructor(message: string) {
		super(message, {
			status: 400,
			code: 'E_CANNOT_SHARE_DEFAULT_COLLECTION',
		});
	}
}
