import { inject } from '@adonisjs/core';
import router from '@adonisjs/core/services/router';
import type { Secret } from '@adonisjs/core/helpers';

import env from '#start/env';
import User from '#models/user';
import { ONE_TIME_TOKEN_TYPE } from '#constants/auth';
import { MailService } from '#services/mail/mail_service';
import ResetPasswordNotification from '#mails/reset_password_notification';
import { OneTimeTokenService } from '#services/auth/one_time_token_service';

const RESET_PASSWORD_ROUTE = 'auth.password.reset';
const TOKEN_TYPE = ONE_TIME_TOKEN_TYPE.PASSWORD_RESET;

export type IssuedResetLink = {
	readonly url: string;
	readonly expiresInHours: number;
};

/**
 * Mints and mails the reset link a forgotten password is recovered through.
 * Split out of `PasswordService`: issuing a link touches no password —
 * redeeming one, `PasswordService.resetPassword`, is what does that.
 */
@inject()
export class PasswordResetLinkService {
	constructor(
		protected readonly oneTimeTokenService: OneTimeTokenService,
		protected readonly mailService: MailService
	) {}

	/**
	 * Mails a reset link, or does nothing at all — and answers the same way
	 * either time. The caller is handed no result, so there is nothing it could
	 * accidentally turn into "that address has an account here".
	 */
	async requestReset(email: string): Promise<void> {
		if (!this.mailService.isEnabled) return;

		const user = await User.findBy('email', email);
		if (!user) return;

		await this.mailResetLink(user);
	}

	/**
	 * Mails a reset link to an account somebody else named — an administrator
	 * from the dashboard, where there is no address to keep secret because the
	 * account is already on screen.
	 *
	 * Nothing here asks whether outgoing mail is configured: the caller does,
	 * and answers 404 when it is not, the way every other mail-backed route
	 * does.
	 */
	async mailResetLink(user: User): Promise<void> {
		const { url, expiresInHours } = await this.issueResetLink(user);

		await this.mailService.send(
			new ResetPasswordNotification({
				user,
				resetUrl: url,
				expiresInHours,
			})
		);
	}

	/**
	 * Mints a reset link and hands it back instead of mailing it.
	 *
	 * Nothing here asks whether outgoing mail is configured: this is what an
	 * instance without it has *instead* of a reset email, printed by the
	 * console for an operator to carry to the account's owner.
	 */
	async issueResetLink(user: User): Promise<IssuedResetLink> {
		await this.oneTimeTokenService.invalidateAll({
			userId: user.id,
			type: TOKEN_TYPE,
		});

		const { secret, lifetimeInHours } = await this.oneTimeTokenService.issue({
			userId: user.id,
			type: TOKEN_TYPE,
		});

		return { url: this.buildResetUrl(secret), expiresInHours: lifetimeInHours };
	}

	/**
	 * Absolute, because nothing in a background mail job knows the host the
	 * request came in on — the same reason the verification link is built this
	 * way.
	 */
	private buildResetUrl(secret: Secret<string>): string {
		return router
			.builder()
			.prefixUrl(env.get('APP_URL'))
			.params({ token: secret.release() })
			.make(RESET_PASSWORD_ROUTE);
	}
}
