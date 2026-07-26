import { Exception } from '@adonisjs/core/exceptions';

const STATUS = 403;
const CODE = 'E_OAUTH_AUTHENTICATION_REFUSED';

export const OAUTH_REFUSAL_REASON = {
	MISSING_EMAIL: 'missing_email',
	UNVERIFIED_EMAIL: 'unverified_email',
	EMAIL_ALREADY_REGISTERED: 'email_already_registered',
} as const;

export type OauthRefusalReason =
	(typeof OAUTH_REFUSAL_REASON)[keyof typeof OAUTH_REFUSAL_REASON];

/**
 * Carries the refusal reason for server-side logging only. Callers must answer
 * the browser with a single generic message whatever the reason is, otherwise
 * the response tells an attacker which emails already own an account.
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
}
