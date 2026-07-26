import logger from '@adonisjs/core/services/logger';
import { Exception } from '@adonisjs/core/exceptions';
import type { HttpContext } from '@adonisjs/core/http';

const STATUS = 403;
const CODE = 'E_OAUTH_AUTHENTICATION_REFUSED';

/**
 * Shown for every refusal, whatever the reason. A message that varies with the
 * cause turns the callback into an account enumeration oracle.
 */
const REFUSED_MESSAGE = 'This Google account cannot be used to sign in';

export const OAUTH_REFUSAL_REASON = {
	MISSING_EMAIL: 'missing_email',
	UNVERIFIED_EMAIL: 'unverified_email',
	EMAIL_ALREADY_REGISTERED: 'email_already_registered',
} as const;

export type OauthRefusalReason =
	(typeof OAUTH_REFUSAL_REASON)[keyof typeof OAUTH_REFUSAL_REASON];

/**
 * Carries the refusal reason for server-side logging only, and renders itself
 * the way `E_INVALID_CREDENTIALS` does: keeping the generic message next to the
 * reason it hides is what stops a caller from ever pairing the two in a
 * response.
 */
export default class OauthAuthenticationRefusedException extends Exception {
	static status = STATUS;
	static code = CODE;

	constructor(readonly reason: OauthRefusalReason) {
		super(`OAuth authentication refused: ${reason}`, {
			status: STATUS,
			code: CODE,
		});
	}

	async handle(error: this, { session, response }: HttpContext) {
		logger.warn(`google auth refused (${error.reason})`);
		session.flash('error', REFUSED_MESSAGE);

		return response.redirectToNamedRoute('home');
	}
}
