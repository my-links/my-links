import { DateTime } from 'luxon';
import { inject } from '@adonisjs/core';
import router from '@adonisjs/core/services/router';
import type { Secret } from '@adonisjs/core/helpers';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';

import env from '#start/env';
import User from '#models/user';
import { ONE_TIME_TOKEN_TYPE } from '#constants/auth';
import { MailService } from '#services/mail/mail_service';
import EmailChangeConfirmation from '#mails/email_change_confirmation';
import { OneTimeTokenService } from '#services/auth/one_time_token_service';
import { AccountAccessService } from '#services/auth/account_access_service';
import EmailChangeRequestedNotification from '#mails/email_change_requested_notification';
import InvalidOneTimeTokenException from '#exceptions/auth/invalid_one_time_token_exception';
import EmailChangeRefusedException, {
	EMAIL_CHANGE_REFUSAL,
} from '#exceptions/auth/email_change_refused_exception';

const CONFIRM_ROUTE = 'auth.email.change.confirm';
const CANCEL_ROUTE = 'auth.email.change.cancel';
const CHANGE_TOKEN_TYPE = ONE_TIME_TOKEN_TYPE.EMAIL_CHANGE;
const CANCELLATION_TOKEN_TYPE = ONE_TIME_TOKEN_TYPE.EMAIL_CHANGE_CANCELLATION;

/**
 * Moving an account from one address to another.
 *
 * The pending address lives on the token, never on `users`: the account keeps
 * its current address, verified as it always was, right up to the transaction
 * that swaps them. A request left to expire therefore needs no cleanup, and no
 * intermediate state can lock anybody out of a sign-in that reads either
 * column.
 *
 * Two links go out, to two different mailboxes. The new one has to confirm —
 * that is the whole proof — and the old one can veto, which is what makes a
 * stolen session survivable.
 */
@inject()
export class EmailChangeService {
	constructor(
		protected readonly oneTimeTokenService: OneTimeTokenService,
		protected readonly accountAccessService: AccountAccessService,
		protected readonly mailService: MailService
	) {}

	/**
	 * Starts a change, or does nothing at all — and tells the caller neither
	 * way. An address that already belongs to somebody is the one case this
	 * flow must not report: doing so would turn the settings form into a way of
	 * asking who has an account here.
	 *
	 * The address the account already holds is refused out loud instead. The
	 * person reading that message is signed in under it, so it says nothing
	 * they did not type themselves.
	 */
	async requestChange(user: User, newEmail: string): Promise<void> {
		if (newEmail === user.email) {
			throw new EmailChangeRefusedException(EMAIL_CHANGE_REFUSAL.SAME_ADDRESS);
		}

		if (await this.isEmailTaken(newEmail)) return;

		await this.invalidatePendingRequest(user);

		const { secret: confirmationSecret, lifetimeInHours } =
			await this.oneTimeTokenService.issue({
				userId: user.id,
				type: CHANGE_TOKEN_TYPE,
				newEmail,
			});
		const { secret: cancellationSecret } = await this.oneTimeTokenService.issue(
			{
				userId: user.id,
				type: CANCELLATION_TOKEN_TYPE,
			}
		);

		await this.mailService.send(
			new EmailChangeConfirmation({
				user,
				newEmailAddress: newEmail,
				confirmationUrl: this.buildUrl(CONFIRM_ROUTE, confirmationSecret),
				expiresInHours: lifetimeInHours,
			})
		);
		await this.mailService.send(
			new EmailChangeRequestedNotification({
				user,
				newEmailAddress: newEmail,
				cancellationUrl: this.buildUrl(CANCEL_ROUTE, cancellationSecret),
				expiresInHours: lifetimeInHours,
			})
		);
	}

	/**
	 * Applies the change, in the transaction that burns the link.
	 *
	 * `email` and `email_verified_at` are written together because following
	 * this link *is* the proof: an account that landed on an address nobody
	 * confirmed would be one this instance could refuse to sign in.
	 *
	 * The address is checked again under the account's lock — the whole point
	 * of a link is that time passes between issuing it and following it, and
	 * somebody else may have registered that address meanwhile.
	 */
	async confirm(secret: Secret<string>): Promise<User> {
		const user = await this.oneTimeTokenService.consume(
			{ secret, type: CHANGE_TOKEN_TYPE },
			async (token, trx) => {
				const newEmail = token.newEmail;
				if (!newEmail) throw new InvalidOneTimeTokenException();

				const owner = await User.query({ client: trx })
					.where('id', token.userId)
					.forUpdate()
					.firstOrFail();

				if (await this.isEmailTaken(newEmail, trx)) {
					throw new EmailChangeRefusedException(
						EMAIL_CHANGE_REFUSAL.ADDRESS_UNAVAILABLE
					);
				}

				owner.email = newEmail;
				owner.emailVerifiedAt = DateTime.now();

				return owner.useTransaction(trx).save();
			}
		);

		// The veto has nothing left to veto, and a verification link addressed
		// to the mailbox this account just left proves nothing about the one it
		// moved to.
		await this.oneTimeTokenService.invalidateAll({
			userId: user.id,
			type: CANCELLATION_TOKEN_TYPE,
		});
		await this.oneTimeTokenService.invalidateAll({
			userId: user.id,
			type: ONE_TIME_TOKEN_TYPE.EMAIL_VERIFICATION,
		});

		return user;
	}

	/**
	 * Disowns a change the current address never asked for.
	 *
	 * Dropping the pending link alone would leave whoever asked for it free to
	 * ask again, so this signs everything out too: someone reaching a settings
	 * form on an account whose owner is vetoing from their mailbox is exactly
	 * the access that has to end.
	 */
	async cancel(secret: Secret<string>): Promise<User> {
		const user = await this.oneTimeTokenService.consume(
			{ secret, type: CANCELLATION_TOKEN_TYPE },
			(token, trx) =>
				User.query({ client: trx })
					.where('id', token.userId)
					.forUpdate()
					.firstOrFail()
		);

		await this.oneTimeTokenService.invalidateAll({
			userId: user.id,
			type: CHANGE_TOKEN_TYPE,
		});
		await this.accountAccessService.revokeAllExcept(user, null);

		return user;
	}

	private async isEmailTaken(
		email: string,
		trx?: TransactionClientContract
	): Promise<boolean> {
		const existingUser = await User.query({ client: trx })
			.where('email', email)
			.first();

		return existingUser !== null;
	}

	/**
	 * Only one change is ever in flight: reissuing has to retire both halves of
	 * the previous one, or an old cancellation link would keep vetoing a
	 * request that no longer exists.
	 */
	private async invalidatePendingRequest(user: User): Promise<void> {
		await this.oneTimeTokenService.invalidateAll({
			userId: user.id,
			type: CHANGE_TOKEN_TYPE,
		});
		await this.oneTimeTokenService.invalidateAll({
			userId: user.id,
			type: CANCELLATION_TOKEN_TYPE,
		});
	}

	/**
	 * Absolute, because nothing in a background mail job knows the host the
	 * request came in on — the same reason the verification and reset links are
	 * built this way.
	 */
	private buildUrl(routeName: string, secret: Secret<string>): string {
		return router
			.builder()
			.prefixUrl(env.get('APP_URL'))
			.params({ token: secret.release() })
			.make(routeName);
	}
}
