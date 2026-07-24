import { describe, expect, it } from 'vitest';

import { deriveSyncStatus } from '@/lib/sync/status';
import { INITIAL_SYNC_BACKOFF_STATE } from '@/lib/sync/backoff';

describe('deriveSyncStatus', () => {
	it('should not be stale when the last sync attempt succeeded', () => {
		const status = deriveSyncStatus(INITIAL_SYNC_BACKOFF_STATE, 1_000);

		expect(status.isStale).toBe(false);
	});

	it('should be stale once a sync attempt has failed', () => {
		const status = deriveSyncStatus(
			{ consecutiveFailures: 1, nextAttemptAt: 5_000 },
			1_000
		);

		expect(status.isStale).toBe(true);
	});

	it('should report no last sync when the cache has never been populated', () => {
		const status = deriveSyncStatus(INITIAL_SYNC_BACKOFF_STATE, 0);

		expect(status.lastSyncedAt).toBeNull();
	});
});
