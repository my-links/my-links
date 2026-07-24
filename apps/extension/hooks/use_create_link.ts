import type { LinkResource } from '@/lib/api/types';
import { createLink, type CreateLinkInput } from '@/lib/api/links';
import { useCollectionsMutation } from '@/hooks/use_collections_mutation';
import {
	getDefaultCollectionId,
	insertLinkIntoTree,
} from '@/lib/collections_tree';

const TEMPORARY_LINK_ID_FACTOR = -1;

/**
 * Builds a placeholder link for the optimistic insert. Its id is
 * intentionally fake (negative, timestamp-derived) — the resync triggered
 * on settle replaces it with the server's real record within a network
 * round-trip, so nothing ever persists this id anywhere.
 */
function toOptimisticLink(
	input: CreateLinkInput,
	collectionIds: number[]
): LinkResource {
	const now = new Date().toISOString();

	return {
		id: TEMPORARY_LINK_ID_FACTOR * Date.now(),
		authorId: TEMPORARY_LINK_ID_FACTOR,
		collectionIds,
		createdAt: now,
		updatedAt: now,
		name: input.name,
		url: input.url,
		description: input.description ?? null,
		favorite: input.favorite,
		// Click tracking is server-side only; a link nobody has opened yet
		// starts at zero either way, so the optimistic record matches.
		clicks: 0,
		lastClickedAt: null,
	};
}

export function useCreateLink() {
	return useCollectionsMutation<CreateLinkInput>({
		mutationFn: createLink,
		applyOptimisticUpdate: (collections, input) => {
			// No collection picked → the backend files it under Inbox, so mirror
			// that optimistically instead of dropping the link from the tree.
			const collectionIds = input.collectionIds?.length
				? input.collectionIds
				: [getDefaultCollectionId(collections)].filter(
						(id): id is number => id !== undefined
					);

			if (collectionIds.length === 0) {
				return collections;
			}

			return insertLinkIntoTree(
				collections,
				toOptimisticLink(input, collectionIds)
			);
		},
	});
}
