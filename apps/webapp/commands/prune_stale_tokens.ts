import { inject } from '@adonisjs/core';
import { BaseCommand } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';

import { STALE_TOKEN_RETENTION_DAYS } from '#constants/auth';
import { StaleTokenPruneService } from '#services/auth/stale_token_prune_service';

/**
 * CLI entry point for `StaleTokenPruneService`, used by native (non-Docker)
 * deployments that schedule it via system cron. The Docker image runs the
 * same logic from `start/scheduler.ts`.
 */
export default class PruneStaleTokens extends BaseCommand {
	static commandName = 'token:prune-stale';
	static description = `Delete one-time tokens and access tokens spent or expired for more than ${STALE_TOKEN_RETENTION_DAYS} day(s)`;
	static options: CommandOptions = { startApp: true };

	@inject()
	async run(staleTokenPruneService: StaleTokenPruneService): Promise<void> {
		const { deletedOneTimeTokens, deletedAccessTokens } =
			await staleTokenPruneService.pruneStale();

		this.logger.success(
			`Pruned ${deletedOneTimeTokens} one-time token(s) and ${deletedAccessTokens} access token(s)`
		);
	}
}
