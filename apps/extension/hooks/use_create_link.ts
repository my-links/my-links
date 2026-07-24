import type { LinkResource } from '@/lib/api/types';
import { insertLinkIntoTree } from '@/lib/collections_tree';
import { createLink, type CreateLinkInput } from '@/lib/api/links';
import { useCollectionsMutation } from '@/hooks/use_collections_mutation';

const TEMPORARY_LINK_ID_FACTOR = -1;

/**
 * Builds a placeholder link for the optimistic insert. Its id is
 * intentionally fake (negative, timestamp-derived) — the resync triggered
 * on settle replaces it with the server's real record within a network
 * round-trip, so nothing ever persists this id anywhere.
 */
function toOptimisticLink(
	input: CreateLinkInput,
	collectionId: number
): LinkResource {
	const now = new Date().toISOString();

	return {
		id: TEMPORARY_LINK_ID_FACTOR * Date.now(),
		authorId: TEMPORARY_LINK_ID_FACTOR,
		collectionId,
		createdAt: now,
		updatedAt: now,
		name: input.name,
		url: input.url,
		description: input.description ?? null,
		favorite: input.favorite,
	};
}

export function useCreateLink() {
	return useCollectionsMutation<CreateLinkInput>({
		mutationFn: createLink,
		applyOptimisticUpdate: (collections, input) => {
			if (input.collectionId === undefined) {
				return collections;
			}

			return insertLinkIntoTree(
				collections,
				toOptimisticLink(input, input.collectionId)
			);
		},
	});
}
