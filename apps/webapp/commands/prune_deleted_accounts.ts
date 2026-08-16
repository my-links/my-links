import { DateTime } from 'luxon';
import { inject } from '@adonisjs/core';
import { BaseCommand } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';

import User from '#models/user';
import { UserService } from '#services/user/user_service';
import { ACCOUNT_DELETION_GRACE_PERIOD_DAYS } from '#constants/account';

/**
 * Meant to run from cron. Wipes accounts whose grace period ran out —
 * `UserService.deleteUser` unchanged, the same self-service wipe a login-time
 * cancellation would otherwise have pre-empted.
 */
export default class PruneDeletedAccounts extends BaseCommand {
	static commandName = 'account:prune-deleted';
	static description = `Permanently delete accounts past the ${ACCOUNT_DELETION_GRACE_PERIOD_DAYS}-day deletion grace period`;
	static options: CommandOptions = { startApp: true };

	@inject()
	async run(userService: UserService): Promise<void> {
		const cutoff = DateTime.now().minus({
			days: ACCOUNT_DELETION_GRACE_PERIOD_DAYS,
		});

		const expiredAccounts = await User.query()
			.whereNotNull('pendingDeletionAt')
			.andWhere('pendingDeletionAt', '<', cutoff.toSQL());

		for (const account of expiredAccounts) {
			await userService.deleteUser(account.id);
		}

		this.logger.success(
			`Permanently deleted ${expiredAccounts.length} account(s) past the grace period`
		);
	}
}
