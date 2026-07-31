import { DateTime } from 'luxon';
import { inject } from '@adonisjs/core';
import router from '@adonisjs/core/services/router';
import type { Secret } from '@adonisjs/core/helpers';

import env from '#start/env';
import User from '#models/user';
import { MailService } from '#services/mail/mail_service';
import { AuthEventService } from '#services/auth/auth_event_service';
import { AUTH_EVENT_TYPE, ONE_TIME_TOKEN_TYPE } from '#constants/auth';
import VerifyEmailNotification from '#mails/verify_email_notification';
import type { AuthEventOrigin } from '#services/auth/auth_event_service';
import { OneTimeTokenService } from '#services/auth/one_time_token_service';
import UnverifiedEmailException from '#exceptions/auth/unverified_email_exception';

const VERIFY_EMAIL_ROUTE = 'auth.verify-email';
const TOKEN_TYPE = ONE_TIME_TOKEN_TYPE.EMAIL_VERIFICATION;

@inject()
export class EmailVerificationService {
	constructor(
		protected readonly oneTimeTokenService: OneTimeTokenService,
		protected readonly authEventService: AuthEventService,
		protected readonly mailService: MailService
	) {}

	/**
	 * Refuses a sign-in whose address nobody has ever confirmed.
	 *
	 * The gate only exists where a confirmation link can actually be sent:
	 * enforcing it on an instance with no outgoing mail would manufacture
	 * accounts their own owners cannot use, which is exactly the self-hosting
	 * this codebase went out of its way to unblock.
	 *
	 * Journaled from here rather than from the controller, for the reason the
	 * credentials refusal is: the refusal travels as an exception nobody
	 * catches, so this is the last place that still knows it happened.
	 */
	async assertCanSignIn(user: User, origin: AuthEventOrigin): Promise<void> {
		if (!this.mailService.isEnabled) return;
		if (user.emailVerifiedAt) return;

		await this.authEventService.record({
			type: AUTH_EVENT_TYPE.LOGIN_BLOCKED_UNVERIFIED,
			userId: user.id,
			...origin,
		});

		throw new UnverifiedEmailException(user.email);
	}

	/**
	 * Mails a fresh link to an address that asked for one, and says nothing
	 * about it either way.
	 *
	 * An unknown address, and one whose account is already confirmed, both do
	 * nothing at all — the caller answers them exactly like the address that
	 * got a link, or the form becomes a way to ask which addresses have an
	 * unconfirmed account here.
	 */
	async resendVerificationLink(email: string): Promise<void> {
		const user = await User.findBy('email', email);
		if (!user || user.emailVerifiedAt) return;

		await this.sendVerificationLink(user);
	}

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

		const { secret, lifetimeInHours } = await this.oneTimeTokenService.issue({
			userId: user.id,
			type: TOKEN_TYPE,
		});

		await this.mailService.send(
			new VerifyEmailNotification({
				user,
				verificationUrl: this.buildVerificationUrl(secret),
				expiresInHours: lifetimeInHours,
			})
		);
	}

	/**
	 * Marks the address confirmed, in the same transaction that burns the link.
	 */
	async confirm(secret: Secret<string>): Promise<User> {
		return this.oneTimeTokenService.consume(
			{ secret, type: TOKEN_TYPE },
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
	private buildVerificationUrl(secret: Secret<string>): string {
		return router
			.builder()
			.prefixUrl(env.get('APP_URL'))
			.params({ token: secret.release() })
			.make(VERIFY_EMAIL_ROUTE);
	}
}
