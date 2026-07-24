import { describe, expect, it } from 'vitest';

import { INITIAL_BACKOFF_MS, MAX_BACKOFF_MS } from '@/lib/sync/constants';
import {
	computeBackoffAfterFailure,
	INITIAL_SYNC_BACKOFF_STATE,
	isSyncBackingOff,
} from '@/lib/sync/backoff';

describe('isSyncBackingOff', () => {
	it('should return false once the backoff window has passed', () => {
		expect(
			isSyncBackingOff({ consecutiveFailures: 1, nextAttemptAt: 100 }, 200)
		).toBe(false);
	});

	it('should return true before the backoff window has passed', () => {
		expect(
			isSyncBackingOff({ consecutiveFailures: 1, nextAttemptAt: 200 }, 100)
		).toBe(true);
	});
});

describe('computeBackoffAfterFailure', () => {
	it('should double the delay on each consecutive failure', () => {
		const now = 1_000_000;

		const first = computeBackoffAfterFailure(INITIAL_SYNC_BACKOFF_STATE, now);
		const second = computeBackoffAfterFailure(first, now);

		expect(first.nextAttemptAt - now).toBe(INITIAL_BACKOFF_MS);
		expect(second.nextAttemptAt - now).toBe(INITIAL_BACKOFF_MS * 2);
	});

	it('should cap the delay at the configured maximum', () => {
		const now = 1_000_000;
		const nearlyMaxedOutState = { consecutiveFailures: 20, nextAttemptAt: 0 };

		const result = computeBackoffAfterFailure(nearlyMaxedOutState, now);

		expect(result.nextAttemptAt - now).toBe(MAX_BACKOFF_MS);
	});
});
