import { useEffect, useState } from 'react';

import { deriveSyncStatus, type SyncStatus } from '@/lib/sync/status';
import {
	INITIAL_SYNC_BACKOFF_STATE,
	type SyncBackoffState,
} from '@/lib/sync/backoff';
import {
	authInvalidStorage,
	collectionsCacheStorage,
	syncBackoffStorage,
} from '@/lib/storage';

export function useSyncStatus(): SyncStatus {
	const [backoffState, setBackoffState] = useState<SyncBackoffState>(
		INITIAL_SYNC_BACKOFF_STATE
	);
	const [fetchedAt, setFetchedAt] = useState(0);
	const [isAuthInvalid, setIsAuthInvalid] = useState(false);

	useEffect(() => {
		void syncBackoffStorage.getValue().then(setBackoffState);
		void collectionsCacheStorage
			.getValue()
			.then((cache) => setFetchedAt(cache.fetchedAt));
		void authInvalidStorage.getValue().then(setIsAuthInvalid);

		const unwatchBackoff = syncBackoffStorage.watch((state) => {
			setBackoffState(state ?? INITIAL_SYNC_BACKOFF_STATE);
		});
		const unwatchCache = collectionsCacheStorage.watch((cache) => {
			setFetchedAt(cache?.fetchedAt ?? 0);
		});
		const unwatchAuthInvalid = authInvalidStorage.watch((value) => {
			setIsAuthInvalid(value ?? false);
		});

		return () => {
			unwatchBackoff();
			unwatchCache();
			unwatchAuthInvalid();
		};
	}, []);

	return deriveSyncStatus(backoffState, fetchedAt, isAuthInvalid);
}
