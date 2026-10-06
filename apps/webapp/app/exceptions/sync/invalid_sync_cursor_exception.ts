import { Exception } from '@adonisjs/core/exceptions';

export class InvalidSyncCursorException extends Exception {
	static status = 422;
	static code = 'E_INVALID_SYNC_CURSOR';

	constructor(message: string) {
		super(message, {
			status: 422,
			code: 'E_INVALID_SYNC_CURSOR',
		});
	}
}
