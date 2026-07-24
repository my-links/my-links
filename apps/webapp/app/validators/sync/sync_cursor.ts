import { DateTime } from 'luxon';

import InvalidSyncCursorException from '#exceptions/sync/invalid_sync_cursor_exception';

/**
 * The cursor a client sends back is the `syncedAt` it received on its
 * previous delta — an ISO 8601 timestamp. Parsing it here rather than
 * downstream keeps a malformed value from silently degrading into "epoch",
 * which would look like a working sync while quietly re-sending everything.
 */
export function parseSyncCursor(
	since: string | undefined
): DateTime | undefined {
	if (since === undefined) {
		return undefined;
	}

	const cursor = DateTime.fromISO(since);
	if (!cursor.isValid) {
		throw new InvalidSyncCursorException(
			`"${since}" is not a valid ISO 8601 sync cursor`
		);
	}

	return cursor;
}
