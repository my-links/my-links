import { DateTime } from 'luxon';
import { inject } from '@adonisjs/core';
import { BaseCommand } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';

import {
	ActivityEventService,
	ACTIVITY_EVENT_RETENTION_DAYS,
} from '#services/activity/activity_event_service';

/**
 * Meant to run from cron. Authentication rows are security evidence and are
 * never touched — `ActivityEventService.pruneBefore` only ever deletes where
 * `subject_type IS NOT NULL`.
 */
export default class PruneActivityEvents extends BaseCommand {
	static commandName = 'activity:prune';
	static description = `Delete activity journal rows older than ${ACTIVITY_EVENT_RETENTION_DAYS} days`;
	static options: CommandOptions = { startApp: true };

	@inject()
	async run(activityEventService: ActivityEventService): Promise<void> {
		const cutoff = DateTime.now().minus({
			days: ACTIVITY_EVENT_RETENTION_DAYS,
		});
		const deletedCount = await activityEventService.pruneBefore(cutoff);

		this.logger.success(`Pruned ${deletedCount} activity event(s)`);
	}
}
