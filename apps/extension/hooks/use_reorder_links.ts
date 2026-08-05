import { reorderLinksInTree } from '@/lib/collections_tree';
import { reorderCollectionLinks } from '@/lib/api/collections';
import { useCollectionsMutation } from '@/hooks/use_collections_mutation';

export interface ReorderLinksVariables {
	collectionId: number;
	linkIds: number[];
}

export function useReorderLinks() {
	return useCollectionsMutation<ReorderLinksVariables>({
		mutationFn: ({ collectionId, linkIds }) =>
			reorderCollectionLinks(collectionId, linkIds),
		applyOptimisticUpdate: (collections, { collectionId, linkIds }) =>
			reorderLinksInTree(collections, collectionId, linkIds),
	});
}
