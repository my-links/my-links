import { Exception } from '@adonisjs/core/exceptions';

const STATUS = 404;
const CODE = 'E_VERIFICATION_RESEND_UNAVAILABLE';

/**
 * Confirming an address is done by following a link from a mailbox, so an
 * instance with no outgoing mail has nothing to resend — and nothing to
 * confirm either, since the sign-in gate is off there. The route answers 404
 * the way `/forgot-password` does.
 *
 * This describes the instance, never an account: every visitor gets the same
 * answer.
 */
export default class VerificationResendUnavailableException extends Exception {
	static status = STATUS;
	static code = CODE;

	constructor() {
		super('Email verification is not available on this instance', {
			status: STATUS,
			code: CODE,
		});
	}
}
