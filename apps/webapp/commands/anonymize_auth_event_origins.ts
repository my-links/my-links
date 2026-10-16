import { inject } from '@adonisjs/core';
import { BaseCommand } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';

import { AUTH_EVENT_ORIGIN_RETENTION_DAYS } from '#constants/auth';
import { AuthEventService } from '#services/auth/auth_event_service';

/**
 * Meant to run from cron, or from `start/scheduler.ts` in the Docker image.
 * The rows stay in the journal: only their address and user agent are blanked.
 */
export default class AnonymizeAuthEventOrigins extends BaseCommand {
	static commandName = 'auth-events:anonymize-origins';
	static description = `Blank the address and user agent of authentication journal rows older than ${AUTH_EVENT_ORIGIN_RETENTION_DAYS} days`;
	static options: CommandOptions = { startApp: true };

	@inject()
	async run(authEventService: AuthEventService): Promise<void> {
		const anonymizedCount = await authEventService.anonymizeExpiredOrigins();

		this.logger.success(
			`Anonymized ${anonymizedCount} authentication event(s)`
		);
	}
}
