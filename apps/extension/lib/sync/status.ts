import type { SyncBackoffState } from '@/lib/sync/backoff';

export interface SyncStatus {
	isStale: boolean;
	isAuthInvalid: boolean;
	lastSyncedAt: number | null;
}

/**
 * A failed sync attempt (`consecutiveFailures > 0`) means whatever is
 * currently in `collectionsCacheStorage` is left over from an earlier
 * success — the UI keeps showing it (never a blank screen) but should mark
 * it stale rather than imply it's live. `isAuthInvalid` refines that: when
 * the failure was specifically a rejected token (401), the fix is a
 * reconnect, not a wait, so the UI surfaces that distinctly.
 */
export function deriveSyncStatus(
	backoffState: SyncBackoffState,
	fetchedAt: number,
	isAuthInvalid: boolean
): SyncStatus {
	return {
		isStale: backoffState.consecutiveFailures > 0,
		isAuthInvalid,
		lastSyncedAt: fetchedAt > 0 ? fetchedAt : null,
	};
}
