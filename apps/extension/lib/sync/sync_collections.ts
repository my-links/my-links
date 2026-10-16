import { fetchCollections, UnauthorizedApiError } from '@/lib/api/collections';
import {
	computeBackoffAfterFailure,
	INITIAL_SYNC_BACKOFF_STATE,
	isSyncBackingOff,
} from '@/lib/sync/backoff';
import {
	apiTokenStorage,
	authInvalidStorage,
	collectionsCacheStorage,
	syncBackoffStorage,
} from '@/lib/storage';

let isSyncing = false;

/**
 * Sole writer of `collectionsCacheStorage`: the background worker calls
 * this on every alarm tick and wake trigger, sidebars only ever read the
 * cache it produces. `isSyncing` dedupes overlapping triggers (e.g. an
 * alarm firing right as a tab-focus event does); backoff protects small
 * self-hosted instances from being hammered while unreachable.
 */
export async function syncCollections(): Promise<void> {
	// Set before the first `await` so two calls fired back-to-back in the
	// same tick (e.g. a sidebar's request racing an alarm) can't both pass
	// this check: the second sees `true` synchronously, not after a delay.
	if (isSyncing) {
		return;
	}
	isSyncing = true;

	try {
		if (!(await apiTokenStorage.getValue())) {
			return;
		}

		// A dead token cannot recover by retrying: only a reconnect clears this flag.
		if (await authInvalidStorage.getValue()) {
			return;
		}

		const backoffState = await syncBackoffStorage.getValue();
		if (isSyncBackingOff(backoffState, Date.now())) {
			return;
		}

		try {
			const { collections, followedCollections } = await fetchCollections();
			await collectionsCacheStorage.setValue({
				collections,
				followedCollections,
				fetchedAt: Date.now(),
			});
			await syncBackoffStorage.setValue(INITIAL_SYNC_BACKOFF_STATE);
		} catch (error) {
			console.error('MyLinks background sync failed', error);
			await syncBackoffStorage.setValue(
				computeBackoffAfterFailure(backoffState, Date.now())
			);
			// Only claim the token is dead when the server explicitly said so
			// (401): a network blip must not masquerade as an auth failure.
			await authInvalidStorage.setValue(error instanceof UnauthorizedApiError);
		}
	} finally {
		isSyncing = false;
	}
}
