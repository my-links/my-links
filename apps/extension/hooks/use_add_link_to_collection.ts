import { addLinkToCollection } from '@/lib/api/links';
import { addLinkToCollectionInTree } from '@/lib/collections_tree';
import { useCollectionsMutation } from '@/hooks/use_collections_mutation';

export interface AddLinkToCollectionVariables {
	linkId: number;
	collectionId: number;
}

export function useAddLinkToCollection() {
	return useCollectionsMutation<AddLinkToCollectionVariables>({
		mutationFn: ({ linkId, collectionId }) =>
			addLinkToCollection(linkId, collectionId),
		applyOptimisticUpdate: (collections, { linkId, collectionId }) =>
			addLinkToCollectionInTree(collections, linkId, collectionId),
	});
}
