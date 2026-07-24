import type { LinkResource } from '@/lib/api/types';
import { replaceLinkInTree } from '@/lib/collections_tree';
import { updateLink, type UpdateLinkInput } from '@/lib/api/links';
import { useCollectionsMutation } from '@/hooks/use_collections_mutation';

export interface UpdateLinkVariables {
	linkId: number;
	input: UpdateLinkInput;
}

function toOptimisticLink(
	linkId: number,
	input: UpdateLinkInput,
	previous: LinkResource | undefined
): LinkResource {
	return {
		id: linkId,
		authorId: previous?.authorId ?? 0,
		createdAt: previous?.createdAt ?? new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		collectionIds: input.collectionIds,
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

			return replaceLinkInTree(
				collections,
				linkId,
				toOptimisticLink(linkId, input, previous)
			);
		},
	});
}
