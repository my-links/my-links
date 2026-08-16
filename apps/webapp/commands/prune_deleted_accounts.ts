import { inject } from '@adonisjs/core';
import { BaseCommand } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';

import { UserService } from '#services/user/user_service';
import { ACCOUNT_DELETION_GRACE_PERIOD_DAYS } from '#constants/account';

/**
 * CLI entry point for `UserService.pruneExpiredDeletions` — used by native
 * (non-Docker) deployments, which schedule it themselves via system cron.
 * The Docker image runs the same logic on a schedule instead, from
 * `start/scheduler.ts`.
 */
export default class PruneDeletedAccounts extends BaseCommand {
	static commandName = 'account:prune-deleted';
	static description = `Permanently delete accounts past the ${ACCOUNT_DELETION_GRACE_PERIOD_DAYS}-day deletion grace period`;
	static options: CommandOptions = { startApp: true };

	@inject()
	async run(userService: UserService): Promise<void> {
		const prunedCount = await userService.pruneExpiredDeletions();

		this.logger.success(
			`Permanently deleted ${prunedCount} account(s) past the grace period`
		);
	}
}
