import { Exception } from '@adonisjs/core/exceptions';

const STATUS = 404;
const CODE = 'E_PASSWORD_RESET_UNAVAILABLE';

/**
 * A reset link is a link in a mailbox, so an instance with no outgoing mail
 * simply does not have this feature — the route answers 404 the way the Google
 * routes do when Google is not configured, rather than pretending to send
 * something. Recovery there goes through `node ace user:reset-password`.
 *
 * This says something about the instance, never about an account, so it is no
 * enumeration oracle: the answer is the same for every visitor.
 */
export default class PasswordResetUnavailableException extends Exception {
	static status = STATUS;
	static code = CODE;

	constructor() {
		super('Password reset is not available on this instance', {
			status: STATUS,
			code: CODE,
		});
	}
}
