import { inject } from '@adonisjs/core';
import { args, flags } from '@adonisjs/core/ace';

import type User from '#models/user';
import { AUTH_EVENT_TYPE } from '#constants/auth';
import AccountCommand from '#commands/_account_command';
import { PasswordService } from '#services/auth/password_service';
import { AuthEventService } from '#services/auth/auth_event_service';
import { newPasswordValidator } from '#validators/auth/new_password_validator';

export const NEW_PASSWORD_PROMPT = 'New password';
export const NEW_PASSWORD_CONFIRMATION_PROMPT = 'Confirm the new password';

export default class ResetUserPassword extends AccountCommand {
	static commandName = 'user:reset-password';
	static description =
		'Set a new password for an account, or print a reset link';

	@args.string({ description: 'Email address of the account', required: false })
	declare email?: string;

	@flags.boolean({
		description: 'Print a single-use reset link instead of setting a password',
	})
	declare link?: boolean;

	@inject()
	async run(
		passwordService: PasswordService,
		authEventService: AuthEventService
	): Promise<void> {
		const account = await this.loadAccount(this.email);
		if (!account) return;

		if (this.link) {
			await this.printResetLink(account, passwordService, authEventService);

			return;
		}

		await this.writeNewPassword(account, passwordService, authEventService);
	}

	/**
	 * What an instance with no outgoing mail has instead of a reset email. The
	 * link is single-use and expires like any other, so an operator carrying it
	 * to the account's owner hands over a door, not a key.
	 */
	private async printResetLink(
		account: User,
		passwordService: PasswordService,
		authEventService: AuthEventService
	): Promise<void> {
		const { url, expiresInHours } =
			await passwordService.issueResetLink(account);

		await authEventService.recordConsoleAction(
			AUTH_EVENT_TYPE.PASSWORD_RESET_REQUESTED,
			account.id
		);

		this.logger.info(
			`Reset link for ${account.email}, valid ${expiresInHours}h:`
		);
		this.logger.log(url);
	}

	private async writeNewPassword(
		account: User,
		passwordService: PasswordService,
		authEventService: AuthEventService
	): Promise<void> {
		const password = await this.prompt.secure(NEW_PASSWORD_PROMPT);
		const passwordConfirmation = await this.prompt.secure(
			NEW_PASSWORD_CONFIRMATION_PROMPT
		);

		const payload = await newPasswordValidator.validate({
			password,
			passwordConfirmation,
		});

		await passwordService.overwritePassword({
			user: account,
			newPassword: payload.password,
		});

		await authEventService.recordConsoleAction(
			AUTH_EVENT_TYPE.PASSWORD_CHANGED,
			account.id
		);

		this.logger.success(
			`${account.email} has a new password — every other session and access token is gone`
		);
	}
}
