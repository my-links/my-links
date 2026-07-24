import { useEffect, useState } from 'react';

import { deriveSyncStatus, type SyncStatus } from '@/lib/sync/status';
import { collectionsCacheStorage, syncBackoffStorage } from '@/lib/storage';
import {
	INITIAL_SYNC_BACKOFF_STATE,
	type SyncBackoffState,
} from '@/lib/sync/backoff';

export function useSyncStatus(): SyncStatus {
	const [backoffState, setBackoffState] = useState<SyncBackoffState>(
		INITIAL_SYNC_BACKOFF_STATE
	);
	const [fetchedAt, setFetchedAt] = useState(0);

	useEffect(() => {
		void syncBackoffStorage.getValue().then(setBackoffState);
		void collectionsCacheStorage
			.getValue()
			.then((cache) => setFetchedAt(cache.fetchedAt));

		const unwatchBackoff = syncBackoffStorage.watch((state) => {
			setBackoffState(state ?? INITIAL_SYNC_BACKOFF_STATE);
		});
		const unwatchCache = collectionsCacheStorage.watch((cache) => {
			setFetchedAt(cache?.fetchedAt ?? 0);
		});

		return () => {
			unwatchBackoff();
			unwatchCache();
		};
	}, []);

	return deriveSyncStatus(backoffState, fetchedAt);
}
