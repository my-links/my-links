import { Exception } from '@adonisjs/core/exceptions';

export default class InvalidExtensionRedirectUriException extends Exception {
	static status = 400;
	static code = 'E_INVALID_EXTENSION_REDIRECT_URI';

	constructor(message: string) {
		super(message, {
			status: 400,
			code: 'E_INVALID_EXTENSION_REDIRECT_URI',
		});
	}
}
