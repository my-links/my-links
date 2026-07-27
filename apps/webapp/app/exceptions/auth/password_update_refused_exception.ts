import { Exception } from '@adonisjs/core/exceptions';
import type { HttpContext } from '@adonisjs/core/http';

const STATUS = 409;
const CODE = 'E_PASSWORD_UPDATE_REFUSED';

export const PASSWORD_UPDATE_REFUSAL = {
	ALREADY_SET: 'already_set',
	NOT_SET: 'not_set',
} as const;

export type PasswordUpdateRefusal =
	(typeof PASSWORD_UPDATE_REFUSAL)[keyof typeof PASSWORD_UPDATE_REFUSAL];

/**
 * Unlike the sign-in refusals, this one names its cause: the person reading it
 * is authenticated on the very account it describes, so there is nothing left
 * to keep from them — only a state their settings page said was impossible.
 */
const REFUSAL_MESSAGES = {
	[PASSWORD_UPDATE_REFUSAL.ALREADY_SET]:
		'This account already has a password — change it instead of setting one',
	[PASSWORD_UPDATE_REFUSAL.NOT_SET]:
		'This account has no password yet — set one instead of changing it',
} as const satisfies Record<PasswordUpdateRefusal, string>;

/**
 * Raised when a password operation contradicts the account it targets. Both
 * cases mean a request reached an endpoint the settings page never offers,
 * so they fail loudly rather than guessing what was meant.
 */
export default class PasswordUpdateRefusedException extends Exception {
	static status = STATUS;
	static code = CODE;

	constructor(readonly refusal: PasswordUpdateRefusal) {
		super(REFUSAL_MESSAGES[refusal], { status: STATUS, code: CODE });
	}

	async handle(error: this, { session, response }: HttpContext) {
		session.flash('error', error.message);

		return response.redirectToNamedRoute('user.settings');
	}
}
