import { inject } from '@adonisjs/core';
import { BaseCommand } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';

import { FaviconOrphanPurgeService } from '#services/favicons/favicon_orphan_purge_service';

/**
 * CLI entry point for `FaviconOrphanPurgeService.purgeOrphans` — used by
 * native (non-Docker) deployments, which schedule it themselves via system
 * cron. The Docker image runs the same logic on a schedule instead, from
 * `start/scheduler.ts`.
 */
export default class PurgeFaviconOrphans extends BaseCommand {
	static commandName = 'favicon:purge-orphans';
	static description =
		'Delete favicon entries and stored files no longer referenced by any link';
	static options: CommandOptions = { startApp: true };

	@inject()
	async run(purgeService: FaviconOrphanPurgeService): Promise<void> {
		const { deletedEntries, deletedFiles } = await purgeService.purgeOrphans();

		this.logger.success(
			`Purged ${deletedEntries} orphaned favicon entrie(s) and ${deletedFiles} orphaned favicon file(s)`
		);
	}
}
