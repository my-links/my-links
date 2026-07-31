import { inject } from '@adonisjs/core';
import { args } from '@adonisjs/core/ace';

import { AUTH_EVENT_TYPE } from '#constants/auth';
import AccountCommand from '#commands/_account_command';
import { AuthEventService } from '#services/auth/auth_event_service';
import { EmailVerificationService } from '#services/auth/email_verification_service';

export default class VerifyUserEmail extends AccountCommand {
	static commandName = 'user:verify-email';
	static description = 'Mark the address of an account as confirmed';

	@args.string({ description: 'Email address of the account', required: false })
	declare email?: string;

	/**
	 * The way in for an account the sign-in gate is holding out on an instance
	 * that cannot mail a confirmation link — and the way out of one that never
	 * arrived.
	 */
	@inject()
	async run(
		emailVerificationService: EmailVerificationService,
		authEventService: AuthEventService
	): Promise<void> {
		const account = await this.loadAccount(this.email);
		if (!account) return;

		const wasConfirmed = await emailVerificationService.markVerified(account);
		if (!wasConfirmed) {
			this.logger.info(`${account.email} was already confirmed`);

			return;
		}

		await authEventService.recordConsoleAction(
			AUTH_EVENT_TYPE.EMAIL_VERIFIED,
			account.id
		);

		this.logger.success(`${account.email} is now confirmed`);
	}
}
