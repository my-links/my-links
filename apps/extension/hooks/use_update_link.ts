import type { LinkResource } from '@/lib/api/types';
import { updateLink, type UpdateLinkInput } from '@/lib/api/links';
import { useCollectionsMutation } from '@/hooks/use_collections_mutation';
import {
	getDefaultCollectionId,
	replaceLinkInTree,
} from '@/lib/collections_tree';

export interface UpdateLinkVariables {
	linkId: number;
	input: UpdateLinkInput;
}

function toOptimisticLink(
	linkId: number,
	input: UpdateLinkInput,
	previous: LinkResource | undefined,
	collectionIds: number[]
): LinkResource {
	return {
		id: linkId,
		authorId: previous?.authorId ?? 0,
		createdAt: previous?.createdAt ?? new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		collectionIds,
		name: input.name,
		url: input.url,
		description: input.description ?? null,
		favorite: input.favorite,
	};
}

export function useUpdateLink() {
	return useCollectionsMutation<UpdateLinkVariables>({
		mutationFn: ({ linkId, input }) => updateLink(linkId, input),
		applyOptimisticUpdate: (collections, { linkId, input }) => {
			const previous = collections
				.flatMap((collection) => collection.links ?? [])
				.find((link) => link.id === linkId);

			// Cleared every collection → the backend re-homes it in Inbox, so
			// reflect that instead of leaving the link in no section at all.
			const collectionIds = input.collectionIds.length
				? input.collectionIds
				: [getDefaultCollectionId(collections)].filter(
						(id): id is number => id !== undefined
					);

			return replaceLinkInTree(
				collections,
				linkId,
				toOptimisticLink(linkId, input, previous, collectionIds)
			);
		},
	});
}
