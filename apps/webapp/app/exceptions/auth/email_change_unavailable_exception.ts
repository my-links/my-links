import { Exception } from '@adonisjs/core/exceptions';

const STATUS = 404;
const CODE = 'E_EMAIL_CHANGE_UNAVAILABLE';

/**
 * Moving an account to another address is settled by two links — one proving
 * the new mailbox, one letting the old one veto the change. Neither can be
 * sent on an instance with no outgoing mail, so the feature is simply absent
 * there, the way the Google routes are absent when Google is not configured.
 *
 * This describes the instance, never an account: every visitor gets the same
 * answer.
 */
export default class EmailChangeUnavailableException extends Exception {
	static status = STATUS;
	static code = CODE;

	constructor() {
		super('Changing your email address is not available on this instance', {
			status: STATUS,
			code: CODE,
		});
	}
}
