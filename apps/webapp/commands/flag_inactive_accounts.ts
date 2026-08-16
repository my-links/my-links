import { inject } from '@adonisjs/core';
import { BaseCommand } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';

import { UserService } from '#services/user/user_service';
import { ACCOUNT_INACTIVITY_THRESHOLD_DAYS } from '#constants/account';

/**
 * CLI entry point for `UserService.flagInactiveAccounts` — used by native
 * (non-Docker) deployments, which schedule it themselves via system cron.
 * The Docker image runs the same logic on a schedule instead, from
 * `start/scheduler.ts`.
 */
export default class FlagInactiveAccounts extends BaseCommand {
	static commandName = 'account:flag-inactive';
	static description = `Start the deletion grace period for accounts inactive for ${ACCOUNT_INACTIVITY_THRESHOLD_DAYS} days`;
	static options: CommandOptions = { startApp: true };

	@inject()
	async run(userService: UserService): Promise<void> {
		const flaggedCount = await userService.flagInactiveAccounts();

		this.logger.success(
			`Flagged ${flaggedCount} inactive account(s) for deletion`
		);
	}
}
