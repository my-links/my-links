import { useMutation, useQueryClient } from '@tanstack/react-query';

import { requestBackgroundSync } from '@/lib/sync/messages';
import { reorderFollowedCollections } from '@/lib/api/collections';
import type { FollowedCollectionWithLinks } from '@/lib/api/types';
import { reorderFollowedCollectionsInTree } from '@/lib/collections_tree';
import { FOLLOWED_COLLECTIONS_QUERY_KEY } from '@/hooks/use_followed_collections';

export interface ReorderFollowedCollectionsVariables {
	collectionIds: number[];
}

interface ReorderFollowedCollectionsContext {
	previousCollections: FollowedCollectionWithLinks[];
}

/**
 * Own optimistic-update/rollback plumbing rather than reusing
 * `useCollectionsMutation` — that hook is hardwired to `COLLECTIONS_QUERY_KEY`
 * and `CollectionWithLinks[]`, but followed collections live in their own
 * query cache with their own (position-less) type, same split as
 * `useFollowedCollections` vs `useCollections`.
 */
export function useReorderFollowedCollections() {
	const queryClient = useQueryClient();

	return useMutation<
		unknown,
		Error,
		ReorderFollowedCollectionsVariables,
		ReorderFollowedCollectionsContext
	>({
		mutationFn: ({ collectionIds }) =>
			reorderFollowedCollections(collectionIds),
		onMutate: async ({ collectionIds }) => {
			await queryClient.cancelQueries({
				queryKey: FOLLOWED_COLLECTIONS_QUERY_KEY,
			});

			const previousCollections =
				queryClient.getQueryData<FollowedCollectionWithLinks[]>(
					FOLLOWED_COLLECTIONS_QUERY_KEY
				) ?? [];

			queryClient.setQueryData(
				FOLLOWED_COLLECTIONS_QUERY_KEY,
				reorderFollowedCollectionsInTree(previousCollections, collectionIds)
			);

			return { previousCollections };
		},
		onError: (_error, _variables, context) => {
			if (context) {
				queryClient.setQueryData(
					FOLLOWED_COLLECTIONS_QUERY_KEY,
					context.previousCollections
				);
			}
		},
		onSettled: () => {
			requestBackgroundSync();
		},
	});
}
