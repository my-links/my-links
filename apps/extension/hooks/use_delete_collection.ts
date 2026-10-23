import { useCollectionsMutation } from '@/hooks/use_collections_mutation';
import { deleteCollection } from '@/lib/api/collections';
import { removeCollectionFromTree } from '@/lib/collections_tree';

export function useDeleteCollection() {
	return useCollectionsMutation<number>({
		mutationFn: deleteCollection,
		applyOptimisticUpdate: (collections, collectionId) =>
			removeCollectionFromTree(collections, collectionId),
	});
}
