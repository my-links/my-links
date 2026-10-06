// Runs the account sweeps and favicon purge in-process (web env only); native deployments use system cron.

import cron from 'node-cron';
import app from '@adonisjs/core/services/app';
import type { ScheduledTask } from 'node-cron';
import logger from '@adonisjs/core/services/logger';

import { AccountRetentionService } from '#services/user/account_retention_service';
import { FaviconOrphanPurgeService } from '#services/favicons/favicon_orphan_purge_service';

const timezone = process.env.TZ ?? 'UTC';

/**
 * node-cron never throws past the task callback: a failure only surfaces
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
		const accountRetentionService = await app.container.make(
			AccountRetentionService
		);
		const flaggedCount = await accountRetentionService.flagInactiveAccounts();
		logger.info(`Flagged ${flaggedCount} inactive account(s) for deletion`);
	},
	{ name: 'account-flag-inactive', timezone }
);
logExecutionFailures(flagInactiveAccountsTask, 'account-flag-inactive');

const pruneExpiredDeletionsTask = cron.schedule(
	'30 3 * * *',
	async () => {
		const accountRetentionService = await app.container.make(
			AccountRetentionService
		);
		const prunedCount = await accountRetentionService.pruneExpiredDeletions();
		logger.info(
			`Permanently deleted ${prunedCount} account(s) past the grace period`
		);
	},
	{ name: 'account-prune-deleted', timezone }
);
logExecutionFailures(pruneExpiredDeletionsTask, 'account-prune-deleted');

const purgeFaviconOrphansTask = cron.schedule(
	'0 4 * * *',
	async () => {
		const purgeService = await app.container.make(FaviconOrphanPurgeService);
		const { deletedEntries, deletedFiles } = await purgeService.purgeOrphans();
		logger.info(
			`Purged ${deletedEntries} orphaned favicon entrie(s) and ${deletedFiles} orphaned favicon file(s)`
		);
	},
	{ name: 'favicon-purge-orphans', timezone }
);
logExecutionFailures(purgeFaviconOrphansTask, 'favicon-purge-orphans');
