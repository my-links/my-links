import { Exception } from '@adonisjs/core/exceptions';

const STATUS = 500;
const CODE = 'E_UNUSABLE_EXTENSION_TOKEN';

/**
 * Raised when token creation returns without a readable secret. The secret is
 * only ever readable at creation, so there is no recovery — the request must
 * fail loudly rather than redirect the extension to a callback carrying
 * nothing.
 */
export default class UnusableExtensionTokenException extends Exception {
	static status = STATUS;
	static code = CODE;

	constructor() {
		super('Token creation did not return a usable value', {
			status: STATUS,
			code: CODE,
		});
	}
}
