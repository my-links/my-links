/*
|--------------------------------------------------------------------------
| Account maintenance schedule
|--------------------------------------------------------------------------
|
| Runs the inactive-account sweep and the deletion prune inside the same
| process as the web server. Restricted to the 'web' environment in
| adonisrc.ts, so ace commands, tests and the REPL don't also register these
| jobs. A native (non-Docker) deployment runs the equivalent ace commands
| through its own system cron instead — see commands/flag_inactive_accounts.ts
| and commands/prune_deleted_accounts.ts.
|
*/

import cron from 'node-cron';
import app from '@adonisjs/core/services/app';
import type { ScheduledTask } from 'node-cron';
import logger from '@adonisjs/core/services/logger';

import { UserService } from '#services/user/user_service';

const timezone = process.env.TZ ?? 'UTC';

/**
 * node-cron never throws past the task callback — a failure only surfaces
 * through this event. Without a listener a broken run logs nothing at all.
 */
function logExecutionFailures(task: ScheduledTask, taskName: string): void {
	task.on('execution:failed', (context) => {
		logger.error(
			{ err: context.execution?.error },
			`Scheduled task "${taskName}" failed`
		);
	});
}

const flagInactiveAccountsTask = cron.schedule(
	'0 3 * * *',
	async () => {
		const userService = await app.container.make(UserService);
		const flaggedCount = await userService.flagInactiveAccounts();
		logger.info(`Flagged ${flaggedCount} inactive account(s) for deletion`);
	},
	{ name: 'account-flag-inactive', timezone }
);
logExecutionFailures(flagInactiveAccountsTask, 'account-flag-inactive');

const pruneExpiredDeletionsTask = cron.schedule(
	'30 3 * * *',
	async () => {
		const userService = await app.container.make(UserService);
		const prunedCount = await userService.pruneExpiredDeletions();
		logger.info(
			`Permanently deleted ${prunedCount} account(s) past the grace period`
		);
	},
	{ name: 'account-prune-deleted', timezone }
);
logExecutionFailures(pruneExpiredDeletionsTask, 'account-prune-deleted');
