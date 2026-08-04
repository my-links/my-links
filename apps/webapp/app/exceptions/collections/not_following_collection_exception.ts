import { Exception } from '@adonisjs/core/exceptions';

export default class NotFollowingCollectionException extends Exception {
	static status = 422;
	static code = 'E_NOT_FOLLOWING_COLLECTION';

	constructor(message: string) {
		super(message, {
			status: 422,
			code: 'E_NOT_FOLLOWING_COLLECTION',
		});
	}
}
