import { deleteCollection } from '@/lib/api/collections';
import { removeCollectionFromTree } from '@/lib/collections_tree';
import { useCollectionsMutation } from '@/hooks/use_collections_mutation';

export function useDeleteCollection() {
	return useCollectionsMutation<number>({
		mutationFn: deleteCollection,
		applyOptimisticUpdate: (collections, collectionId) =>
			removeCollectionFromTree(collections, collectionId),
	});
}
