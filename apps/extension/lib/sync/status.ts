import type { SyncBackoffState } from '@/lib/sync/backoff';

export interface SyncStatus {
	isStale: boolean;
	lastSyncedAt: number | null;
}

/**
 * A failed sync attempt (`consecutiveFailures > 0`) means whatever is
 * currently in `collectionsCacheStorage` is left over from an earlier
 * success — the UI keeps showing it (never a blank screen) but should mark
 * it stale rather than imply it's live.
 */
export function deriveSyncStatus(
	backoffState: SyncBackoffState,
	fetchedAt: number
): SyncStatus {
	return {
		isStale: backoffState.consecutiveFailures > 0,
		lastSyncedAt: fetchedAt > 0 ? fetchedAt : null,
	};
}
