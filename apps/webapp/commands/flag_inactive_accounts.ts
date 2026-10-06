import { inject } from '@adonisjs/core';
import { BaseCommand } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';

import { ACCOUNT_INACTIVITY_THRESHOLD_DAYS } from '#constants/account';
import { AccountRetentionService } from '#services/user/account_retention_service';

/**
 * CLI entry point for `AccountRetentionService.flagInactiveAccounts`, used by native
 * (non-Docker) deployments, which schedule it themselves via system cron.
 * The Docker image runs the same logic on a schedule instead, from
 * `start/scheduler.ts`.
 */
export default class FlagInactiveAccounts extends BaseCommand {
	static commandName = 'account:flag-inactive';
	static description = `Start the deletion grace period for accounts inactive for ${ACCOUNT_INACTIVITY_THRESHOLD_DAYS} days`;
	static options: CommandOptions = { startApp: true };

	@inject()
	async run(accountRetentionService: AccountRetentionService): Promise<void> {
		const flaggedCount = await accountRetentionService.flagInactiveAccounts();

		this.logger.success(
			`Flagged ${flaggedCount} inactive account(s) for deletion`
		);
	}
}
