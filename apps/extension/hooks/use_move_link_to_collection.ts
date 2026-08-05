import { moveLinkToCollection } from '@/lib/api/links';
import { moveLinkBetweenCollectionsInTree } from '@/lib/collections_tree';
import { useCollectionsMutation } from '@/hooks/use_collections_mutation';

export interface MoveLinkToCollectionVariables {
	linkId: number;
	fromCollectionId: number;
	toCollectionId: number;
}

export function useMoveLinkToCollection() {
	return useCollectionsMutation<MoveLinkToCollectionVariables>({
		mutationFn: ({ linkId, fromCollectionId, toCollectionId }) =>
			moveLinkToCollection(linkId, fromCollectionId, toCollectionId),
		applyOptimisticUpdate: (
			collections,
			{ linkId, fromCollectionId, toCollectionId }
		) =>
			moveLinkBetweenCollectionsInTree(
				collections,
				linkId,
				fromCollectionId,
				toCollectionId
			),
	});
}
