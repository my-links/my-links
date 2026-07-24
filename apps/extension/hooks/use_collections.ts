import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { collectionsCacheStorage } from '@/lib/storage';
import { fetchCollections } from '@/lib/api/collections';
import type { CollectionWithLinks } from '@/lib/api/types';
import { requestBackgroundSync } from '@/lib/sync/messages';

export const COLLECTIONS_QUERY_KEY = ['collections'] as const;

interface UseCollectionsReturn {
	collections: CollectionWithLinks[];
	isLoading: boolean;
	error: Error | null;
}

/**
 * Never fetches on its own — the background worker is the sole network
 * caller (see `sync_collections.ts`). This hook only asks it to refresh
 * early (`requestBackgroundSync`) and mirrors whatever it writes to
 * `collectionsCacheStorage` into the query cache, which is also how every
 * other open sidebar/window picks up the same update.
 */
export function useCollections(): UseCollectionsReturn {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: COLLECTIONS_QUERY_KEY,
		queryFn: fetchCollections,
		staleTime: Infinity,
	});

	useEffect(() => {
		requestBackgroundSync();

		return collectionsCacheStorage.watch((nextCache) => {
			if (nextCache) {
				queryClient.setQueryData(COLLECTIONS_QUERY_KEY, nextCache.collections);
			}
		});
	}, [queryClient]);

	return {
		collections: query.data ?? [],
		isLoading: query.isPending,
		error: query.error,
	};
}
