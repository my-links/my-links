import { Exception } from '@adonisjs/core/exceptions';

export default class InvalidCollectionMembershipException extends Exception {
	static status = 409;
	static code = 'E_INVALID_COLLECTION_MEMBERSHIP';

	constructor(message: string) {
		super(message, {
			status: 409,
			code: 'E_INVALID_COLLECTION_MEMBERSHIP',
		});
	}
}
