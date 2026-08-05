import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { collectionsCacheStorage } from '@/lib/storage';
import { fetchCollections } from '@/lib/api/collections';
import { requestBackgroundSync } from '@/lib/sync/messages';
import type { FollowedCollectionWithLinks } from '@/lib/api/types';

export const FOLLOWED_COLLECTIONS_QUERY_KEY = ['followedCollections'] as const;

interface UseFollowedCollectionsReturn {
	followedCollections: FollowedCollectionWithLinks[];
	isLoading: boolean;
	error: Error | null;
}

/**
 * Same read-only pattern as `useCollections` — the background worker is the
 * sole network caller, this hook only mirrors `collectionsCacheStorage` into
 * its own query cache. Kept as a separate query key rather than folded into
 * `useCollections`'s `CollectionWithLinks[]` cache entry: every mutation hook
 * (`useCollectionsMutation` and friends) reads that entry as a plain array of
 * owned collections for its optimistic tree updates, and followed
 * collections are never mutated from the extension.
 */
export function useFollowedCollections(): UseFollowedCollectionsReturn {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: FOLLOWED_COLLECTIONS_QUERY_KEY,
		queryFn: async () => (await fetchCollections()).followedCollections,
		staleTime: Infinity,
	});

	useEffect(() => {
		requestBackgroundSync();

		return collectionsCacheStorage.watch((nextCache) => {
			if (nextCache) {
				queryClient.setQueryData(
					FOLLOWED_COLLECTIONS_QUERY_KEY,
					nextCache.followedCollections
				);
			}
		});
	}, [queryClient]);

	return {
		followedCollections: query.data ?? [],
		isLoading: query.isPending,
		error: query.error,
	};
}
