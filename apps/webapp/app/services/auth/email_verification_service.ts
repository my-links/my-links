import { DateTime } from 'luxon';
import { inject } from '@adonisjs/core';
import router from '@adonisjs/core/services/router';

import env from '#start/env';
import User from '#models/user';
import { ONE_TIME_TOKEN_TYPE } from '#constants/auth';
import { MailService } from '#services/mail/mail_service';
import VerifyEmailNotification from '#mails/verify_email_notification';
import { OneTimeTokenService } from '#services/auth/one_time_token_service';

const VERIFY_EMAIL_ROUTE = 'auth.verify-email';
const TOKEN_TYPE = ONE_TIME_TOKEN_TYPE.EMAIL_VERIFICATION;

@inject()
export class EmailVerificationService {
	constructor(
		protected readonly oneTimeTokenService: OneTimeTokenService,
		protected readonly mailService: MailService
	) {}

	/**
	 * Mails a fresh confirmation link, replacing whatever link was outstanding.
	 *
	 * An instance with no outgoing mail issues nothing at all: the token would
	 * be a row nobody could ever redeem. Email verification is simply absent
	 * there — no feature is gated behind it — and account recovery goes through
	 * the ace commands instead.
	 */
	async sendVerificationLink(user: User): Promise<void> {
		if (!this.mailService.isEnabled) return;

		await this.oneTimeTokenService.invalidateAll({
			userId: user.id,
			type: TOKEN_TYPE,
		});

		const { plainToken, lifetimeInHours } =
			await this.oneTimeTokenService.issue({
				userId: user.id,
				type: TOKEN_TYPE,
			});

		await this.mailService.send(
			new VerifyEmailNotification({
				user,
				verificationUrl: this.buildVerificationUrl(plainToken),
				expiresInHours: lifetimeInHours,
			})
		);
	}

	/**
	 * Marks the address confirmed, in the same transaction that burns the link.
	 */
	async confirm(plainToken: string): Promise<User> {
		return this.oneTimeTokenService.consume(
			{ plainToken, type: TOKEN_TYPE },
			async (token, trx) => {
				const user = await User.query({ client: trx })
					.where('id', token.userId)
					.forUpdate()
					.firstOrFail();

				user.emailVerifiedAt = DateTime.now();

				return user.useTransaction(trx).save();
			}
		);
	}

	/**
	 * Built here rather than in the mail class: the notification is handed a
	 * finished URL so it stays independent of how routing is wired, and the
	 * absolute prefix is needed because nothing in a background mail job knows
	 * the host the request came in on.
	 */
	private buildVerificationUrl(plainToken: string): string {
		return router
			.builder()
			.prefixUrl(env.get('APP_URL'))
			.params({ token: plainToken })
			.make(VERIFY_EMAIL_ROUTE);
	}
}
