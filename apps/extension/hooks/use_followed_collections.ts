import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useQueryDataSnapshot } from '@/hooks/use_query_data_snapshot';
import { fetchCollections } from '@/lib/api/collections';
import type { FollowedCollectionWithLinks } from '@/lib/api/types';
import { collectionsCacheStorage } from '@/lib/storage';
import { requestBackgroundSync } from '@/lib/sync/messages';

export const FOLLOWED_COLLECTIONS_QUERY_KEY = ['followedCollections'] as const;

type UseFollowedCollectionsReturn = {
	followedCollections: FollowedCollectionWithLinks[];
	isLoading: boolean;
	error: Error | null;
};

/**
 * Same read-only-fetch pattern as `useCollections`: the background worker is
 * the sole network caller, this hook only mirrors `collectionsCacheStorage`
 * into its own query cache. Kept as a separate query key rather than folded
 * into `useCollections`'s `CollectionWithLinks[]` cache entry: every owned
 * mutation hook (`useCollectionsMutation` and friends) reads that entry as a
 * plain array of owned collections for its optimistic tree updates, and the
 * shape differs (no `position`, no link `collectionIds`, see types.ts).
 * `useReorderFollowedCollections` is the one mutation hook against this cache.
 */
export function useFollowedCollections(): UseFollowedCollectionsReturn {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: FOLLOWED_COLLECTIONS_QUERY_KEY,
		queryFn: async () => (await fetchCollections()).followedCollections,
		staleTime: Infinity,
	});

	const followedCollections =
		useQueryDataSnapshot<FollowedCollectionWithLinks[]>(
			FOLLOWED_COLLECTIONS_QUERY_KEY
		) ?? [];

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
		followedCollections,
		isLoading: query.isPending,
		error: query.error,
	};
}
