import { Exception } from '@adonisjs/core/exceptions';
import type { HttpContext } from '@adonisjs/core/http';

const STATUS = 409;
const CODE = 'E_EMAIL_CHANGE_REFUSED';

export const EMAIL_CHANGE_REFUSAL = {
	SAME_ADDRESS: 'same_address',
	ADDRESS_UNAVAILABLE: 'address_unavailable',
} as const;

export type EmailChangeRefusal =
	(typeof EMAIL_CHANGE_REFUSAL)[keyof typeof EMAIL_CHANGE_REFUSAL];

/**
 * Both causes are named, and neither leaks anything.
 *
 * `SAME_ADDRESS` describes the address the reader is already signed in under.
 * `ADDRESS_UNAVAILABLE` is only ever reached by someone holding a link sent to
 * the address in question, so they have already proved they read that mailbox
 * — the same proof a password reset would have given them anyway.
 *
 * The address being taken *at request time* is deliberately not in here: that
 * one is answered exactly like a success, or the form would become a list of
 * who has an account on this instance.
 */
const REFUSAL_MESSAGES = {
	[EMAIL_CHANGE_REFUSAL.SAME_ADDRESS]:
		'This is already the address on this account',
	[EMAIL_CHANGE_REFUSAL.ADDRESS_UNAVAILABLE]:
		'That address can no longer be used — ask for the change again',
} as const satisfies Record<EmailChangeRefusal, string>;

export default class EmailChangeRefusedException extends Exception {
	static status = STATUS;
	static code = CODE;

	constructor(readonly refusal: EmailChangeRefusal) {
		super(REFUSAL_MESSAGES[refusal], { status: STATUS, code: CODE });
	}

	/**
	 * Back where the request came from, because the two causes are reached from
	 * two different places: one from the settings form, the other from a link in
	 * a mailbox that has no page of its own to return to.
	 */
	async handle(error: this, { session, response }: HttpContext) {
		session.flash('error', error.message);

		return response.redirect().back();
	}
}
