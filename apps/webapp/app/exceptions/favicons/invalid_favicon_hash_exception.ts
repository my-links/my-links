import { Exception } from '@adonisjs/core/exceptions';

export class InvalidFaviconHashException extends Exception {
	static status = 500;
	static code = 'E_INVALID_FAVICON_HASH';

	constructor(hash: string) {
		super(`Invalid favicon content hash: ${hash}`, {
			status: 500,
			code: 'E_INVALID_FAVICON_HASH',
		});
	}
}
