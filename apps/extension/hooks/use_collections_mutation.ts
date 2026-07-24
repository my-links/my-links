import {
	useMutation,
	useQueryClient,
	type UseMutationResult,
} from '@tanstack/react-query';

import type { CollectionWithLinks } from '@/lib/api/types';
import { requestBackgroundSync } from '@/lib/sync/messages';
import { COLLECTIONS_QUERY_KEY } from '@/hooks/use_collections';

interface UseCollectionsMutationOptions<TVariables> {
	mutationFn: (variables: TVariables) => Promise<unknown>;
	applyOptimisticUpdate: (
		collections: CollectionWithLinks[],
		variables: TVariables
	) => CollectionWithLinks[];
}

interface CollectionsMutationContext {
	previousCollections: CollectionWithLinks[];
}

/**
 * Shared optimistic-update/rollback plumbing for every collections/links
 * mutation. Local-only: it never writes `collectionsCacheStorage` itself
 * (the background worker is the sole writer, see storage.ts) — on settle it
 * nudges a resync so the real server state lands in storage and propagates
 * to every open window, correcting anything the optimistic guess got wrong
 * (e.g. a create-link placeholder's temporary id).
 */
export function useCollectionsMutation<TVariables>({
	mutationFn,
	applyOptimisticUpdate,
}: UseCollectionsMutationOptions<TVariables>): UseMutationResult<
	unknown,
	Error,
	TVariables,
	CollectionsMutationContext
> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn,
		onMutate: async (variables) => {
			await queryClient.cancelQueries({ queryKey: COLLECTIONS_QUERY_KEY });

			const previousCollections =
				queryClient.getQueryData<CollectionWithLinks[]>(
					COLLECTIONS_QUERY_KEY
				) ?? [];

			queryClient.setQueryData(
				COLLECTIONS_QUERY_KEY,
				applyOptimisticUpdate(previousCollections, variables)
			);

			return { previousCollections };
		},
		onError: (_error, _variables, context) => {
			if (context) {
				queryClient.setQueryData(
					COLLECTIONS_QUERY_KEY,
					context.previousCollections
				);
			}
		},
		onSettled: () => {
			requestBackgroundSync();
		},
	});
}
