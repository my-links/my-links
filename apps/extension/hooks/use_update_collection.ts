import { replaceCollectionInTree } from '@/lib/collections_tree';
import { useCollectionsMutation } from '@/hooks/use_collections_mutation';
import { updateCollection, type CollectionInput } from '@/lib/api/collections';

export interface UpdateCollectionVariables {
	collectionId: number;
	input: CollectionInput;
}

export function useUpdateCollection() {
	return useCollectionsMutation<UpdateCollectionVariables>({
		mutationFn: ({ collectionId, input }) =>
			updateCollection(collectionId, input),
		applyOptimisticUpdate: (collections, { collectionId, input }) =>
			replaceCollectionInTree(collections, collectionId, {
				name: input.name,
				description: input.description,
				visibility: input.visibility,
				icon: input.icon ?? null,
			}),
	});
}
