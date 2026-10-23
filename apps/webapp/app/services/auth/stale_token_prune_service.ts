import db from '@adonisjs/lucid/services/db';
import { DateTime } from 'luxon';

import { STALE_TOKEN_RETENTION_DAYS } from '#constants/auth';
import OneTimeToken from '#models/one_time_token';

export type StaleTokenPruneResult = {
	readonly deletedOneTimeTokens: number;
	readonly deletedAccessTokens: number;
};

/**
 * Removes credential tokens that can no longer do anything. A consumed or
 * expired one-time token is dead weight, and an email change row keeps the
 * address the account was moving to for no reason at all.
 */
export class StaleTokenPruneService {
	async pruneStale(): Promise<StaleTokenPruneResult> {
		const cutoff = DateTime.now().minus({ days: STALE_TOKEN_RETENTION_DAYS });

		return {
			deletedOneTimeTokens: await this.pruneOneTimeTokens(cutoff),
			deletedAccessTokens: await this.pruneAccessTokens(cutoff),
		};
	}

	private async pruneOneTimeTokens(cutoff: DateTime): Promise<number> {
		const [deletedRowCount] = await OneTimeToken.query()
			.where('consumedAt', '<', cutoff.toJSDate())
			.orWhere('expiresAt', '<', cutoff.toJSDate())
			.delete();

		return Number(deletedRowCount ?? 0);
	}

	private async pruneAccessTokens(cutoff: DateTime): Promise<number> {
		const deletedRowCount = await db
			.from('auth_access_tokens')
			.where('expires_at', '<', cutoff.toJSDate())
			.delete();

		return Number(deletedRowCount);
	}
}
