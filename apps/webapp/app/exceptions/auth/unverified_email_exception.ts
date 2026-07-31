import { Exception } from '@adonisjs/core/exceptions';
import type { HttpContext } from '@adonisjs/core/http';

const STATUS = 403;
const CODE = 'E_UNVERIFIED_EMAIL';

/**
 * The sentence a visitor whose address is still unconfirmed reads. Exported so
 * the specs assert against what the refusal actually says.
 */
export const UNVERIFIED_EMAIL_MESSAGE =
	'Confirm your email address before signing in — we sent a link to it';

/**
 * The address on this account has never been confirmed, on an instance that
 * can send the link that confirms it.
 *
 * Unlike the credentials refusal, this one names its cause: it is only ever
 * raised once the right password has been presented, so the reader has already
 * proved the account is theirs. A generic message here would send someone
 * chasing a password they never got wrong.
 */
export default class UnverifiedEmailException extends Exception {
	static status = STATUS;
	static code = CODE;

	constructor(readonly unconfirmedEmail: string) {
		super(UNVERIFIED_EMAIL_MESSAGE, { status: STATUS, code: CODE });
	}

	/**
	 * The address travels back as a flash message so the login page can offer
	 * to send a fresh link without asking the visitor to type it again. It is
	 * the address they just authenticated against, so handing it back tells
	 * them nothing they did not already know.
	 */
	async handle(error: this, { session, response }: HttpContext) {
		session.flash('error', error.message);
		session.flash('unconfirmedEmail', error.unconfirmedEmail);

		return response.redirectToNamedRoute('auth.login');
	}
}
