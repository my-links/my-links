import { reorderCollections } from '@/lib/api/collections';
import type { CollectionVisibility } from '@/lib/api/types';
import { reorderCollectionsInTree } from '@/lib/collections_tree';
import { useCollectionsMutation } from '@/hooks/use_collections_mutation';

export interface ReorderCollectionsVariables {
	visibility: CollectionVisibility;
	collectionIds: number[];
}

export function useReorderCollections() {
	return useCollectionsMutation<ReorderCollectionsVariables>({
		mutationFn: ({ visibility, collectionIds }) =>
			reorderCollections(visibility, collectionIds),
		applyOptimisticUpdate: (collections, { visibility, collectionIds }) =>
			reorderCollectionsInTree(collections, visibility, collectionIds),
	});
}
