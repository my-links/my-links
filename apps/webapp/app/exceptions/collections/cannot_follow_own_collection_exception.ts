import { Exception } from '@adonisjs/core/exceptions';

export default class CannotFollowOwnCollectionException extends Exception {
	static status = 422;
	static code = 'E_CANNOT_FOLLOW_OWN_COLLECTION';

	constructor(message: string) {
		super(message, {
			status: 422,
			code: 'E_CANNOT_FOLLOW_OWN_COLLECTION',
		});
	}
}
