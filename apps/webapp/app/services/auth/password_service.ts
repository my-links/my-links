import { DateTime } from 'luxon';
import { inject } from '@adonisjs/core';
import type { Secret } from '@adonisjs/core/helpers';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';

import User from '#models/user';
import PasswordAuth from '#models/password_auth';
import { ONE_TIME_TOKEN_TYPE } from '#constants/auth';
import { MailService } from '#services/mail/mail_service';
import { PasswordHasher } from '#services/auth/password_hasher';
import PasswordSetNotification from '#mails/password_set_notification';
import { OneTimeTokenService } from '#services/auth/one_time_token_service';
import { AccountAccessService } from '#services/auth/account_access_service';
import PasswordChangedNotification from '#mails/password_changed_notification';
import PasswordUpdateRefusedException, {
	PASSWORD_UPDATE_REFUSAL,
} from '#exceptions/auth/password_update_refused_exception';

const TOKEN_TYPE = ONE_TIME_TOKEN_TYPE.PASSWORD_RESET;

export type SetPasswordRequest = {
	readonly user: User;
	readonly newPassword: string;
};

export type ChangePasswordRequest = SetPasswordRequest & {
	/**
	 * The session driving the change, the only one that survives it. Naming it
	 * here rather than reading it off a request is what keeps this service
	 * free of `HttpContext`.
	 */
	readonly currentSessionId: string;
};

export type ResetPasswordRequest = {
	readonly secret: Secret<string>;
	readonly newPassword: string;
};

/**
 * Everything that writes `password_auths`. Reset-link issuing lives in
 * `PasswordResetLinkService` — redeeming one, `resetPassword` below, is the
 * only point where the two meet.
 *
 * The write paths differ only in what they are allowed to assume, so they
 * share one private writer: a password that reaches the database through
 * a path that forgot to stamp `password_changed_at`, or forgot to revoke, is
 * exactly the kind of drift a second implementation produces.
 */
@inject()
export class PasswordService {
	constructor(
		protected readonly oneTimeTokenService: OneTimeTokenService,
		protected readonly passwordHasher: PasswordHasher,
		protected readonly accountAccessService: AccountAccessService,
		protected readonly mailService: MailService
	) {}

	/**
	 * The transaction is optional because the anti-lockout guard has to count
	 * this method inside the one that removes another.
	 */
	async hasPassword(
		user: User,
		trx?: TransactionClientContract
	): Promise<boolean> {
		const passwordAuth = await this.findPasswordAuth(user, trx);

		return passwordAuth !== null;
	}

	/**
	 * Checks a password without journaling a sign-in. Sudo mode verifies the
	 * very same secret the login form does, and letting it reuse
	 * `CredentialsAuthService` would write "logged in" into the audit trail
	 * every time somebody confirms their identity to change a setting.
	 */
	async verify(user: User, plainPassword: string): Promise<boolean> {
		const passwordAuth = await this.findPasswordAuth(user);
		if (!passwordAuth) return false;

		return this.passwordHasher.verify(passwordAuth.password, plainPassword);
	}

	/**
	 * Gives a first password to an account that had none — the migration path
	 * off a sole OAuth identity.
	 *
	 * Nothing is revoked: no credential was replaced, so no existing session or
	 * token became suspect. The mail is a notification rather than a gate,
	 * because the person doing this is already signed in and already controls
	 * the account; sudo mode is what stands in an intruder's way here.
	 */
	async setPassword({ user, newPassword }: SetPasswordRequest): Promise<void> {
		if (await this.hasPassword(user)) {
			throw new PasswordUpdateRefusedException(
				PASSWORD_UPDATE_REFUSAL.ALREADY_SET
			);
		}

		await this.writePassword(user, newPassword);
		await this.mailService.send(new PasswordSetNotification({ user }));
	}

	/**
	 * Replaces an existing password, and with it every access the old one
	 * bought: other sessions, extension tokens, and any reset link still in
	 * flight.
	 */
	async changePassword({
		user,
		newPassword,
		currentSessionId,
	}: ChangePasswordRequest): Promise<void> {
		if (!(await this.hasPassword(user))) {
			throw new PasswordUpdateRefusedException(PASSWORD_UPDATE_REFUSAL.NOT_SET);
		}

		await this.writePassword(user, newPassword);
		await this.revokeEveryOtherAccess(user, currentSessionId);
		await this.mailService.send(new PasswordChangedNotification({ user }));
	}

	/**
	 * Writes a password on the operator's authority, from the console.
	 *
	 * Everything the previous credential reached goes with it, whether or not
	 * there was one: an operator reaching for this command is recovering an
	 * account, and an account being recovered is an account whose current
	 * sessions and extension tokens are exactly what nobody can vouch for.
	 */
	async overwritePassword({
		user,
		newPassword,
	}: SetPasswordRequest): Promise<void> {
		const hadPassword = await this.hasPassword(user);

		await this.writePassword(user, newPassword);
		await this.revokeEveryOtherAccess(user, null);
		await this.mailService.send(
			hadPassword
				? new PasswordChangedNotification({ user })
				: new PasswordSetNotification({ user })
		);
	}

	/**
	 * Redeems a reset link.
	 *
	 * The write happens inside the transaction that burns the token, so a
	 * failure anywhere leaves the link usable instead of spent. Everything the
	 * old password reached is dropped afterwards, including the sessions —
	 * whoever asked for this link is not signed in anywhere yet, and if
	 * somebody else was, that is precisely who this is being taken away from.
	 */
	async resetPassword({
		secret,
		newPassword,
	}: ResetPasswordRequest): Promise<User> {
		const user = await this.oneTimeTokenService.consume(
			{ secret, type: TOKEN_TYPE },
			async (token, trx) => {
				const owner = await User.query({ client: trx })
					.where('id', token.userId)
					.forUpdate()
					.firstOrFail();

				await this.writePassword(owner, newPassword, trx);

				// Following the link proved control of the mailbox, which is the
				// very claim `email_verified_at` records. Leaving it null here
				// would mean an account recovered through its inbox still counts
				// as one whose address nobody ever confirmed.
				owner.emailVerifiedAt ??= DateTime.now();

				return owner.useTransaction(trx).save();
			}
		);

		await this.revokeEveryOtherAccess(user, null);
		await this.mailService.send(new PasswordChangedNotification({ user }));

		return user;
	}

	private findPasswordAuth(
		user: User,
		trx?: TransactionClientContract
	): Promise<PasswordAuth | null> {
		return PasswordAuth.query({ client: trx }).where('userId', user.id).first();
	}

	/**
	 * The single writer. The plain value is handed to the model on purpose:
	 * hashing belongs to its `beforeSave` hook, so no caller can reach the
	 * column with a value that skipped it.
	 */
	private writePassword(
		user: User,
		newPassword: string,
		trx?: TransactionClientContract
	): Promise<PasswordAuth> {
		return PasswordAuth.updateOrCreate(
			{ userId: user.id },
			{ password: newPassword, passwordChangedAt: DateTime.now() },
			{ client: trx }
		);
	}

	private async revokeEveryOtherAccess(
		user: User,
		sessionIdToKeep: string | null
	): Promise<void> {
		await this.accountAccessService.revokeAllExcept(user, sessionIdToKeep);
		await this.oneTimeTokenService.invalidateAll({
			userId: user.id,
			type: TOKEN_TYPE,
		});
	}
}
