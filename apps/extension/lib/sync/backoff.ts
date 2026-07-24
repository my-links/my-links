import {
	BACKOFF_MULTIPLIER,
	INITIAL_BACKOFF_MS,
	MAX_BACKOFF_MS,
} from '@/lib/sync/constants';

export interface SyncBackoffState {
	consecutiveFailures: number;
	nextAttemptAt: number;
}

export const INITIAL_SYNC_BACKOFF_STATE: SyncBackoffState = {
	consecutiveFailures: 0,
	nextAttemptAt: 0,
};

export function isSyncBackingOff(
	backoffState: SyncBackoffState,
	now: number
): boolean {
	return now < backoffState.nextAttemptAt;
}

/**
 * Protects small self-hosted instances from being hammered by a runaway
 * background worker: each consecutive failure doubles the wait, capped at
 * `MAX_BACKOFF_MS`.
 */
export function computeBackoffAfterFailure(
	backoffState: SyncBackoffState,
	now: number
): SyncBackoffState {
	const consecutiveFailures = backoffState.consecutiveFailures + 1;
	const delayMs = Math.min(
		INITIAL_BACKOFF_MS * BACKOFF_MULTIPLIER ** (consecutiveFailures - 1),
		MAX_BACKOFF_MS
	);
	return { consecutiveFailures, nextAttemptAt: now + delayMs };
}
