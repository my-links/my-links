import { Exception } from '@adonisjs/core/exceptions';

export default class ForeignCollectionException extends Exception {
	static status = 422;
	static code = 'E_FOREIGN_COLLECTION';

	constructor(message: string) {
		super(message, {
			status: 422,
			code: 'E_FOREIGN_COLLECTION',
		});
	}
}
