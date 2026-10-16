import { Exception } from '@adonisjs/core/exceptions';

export class InvalidLinkUrlException extends Exception {
	static status = 422;
	static code = 'E_INVALID_LINK_URL';

	constructor(message: string) {
		super(message, { status: 422, code: 'E_INVALID_LINK_URL' });
	}
}
