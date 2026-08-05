import type { CollectionWithLinks } from '@/lib/api/types';
import { insertCollectionIntoTree } from '@/lib/collections_tree';
import { useCollectionsMutation } from '@/hooks/use_collections_mutation';
import { createCollection, type CollectionInput } from '@/lib/api/collections';

const TEMPORARY_COLLECTION_ID_FACTOR = -1;

function toOptimisticCollection(input: CollectionInput): CollectionWithLinks {
	const now = new Date().toISOString();

	return {
		id: TEMPORARY_COLLECTION_ID_FACTOR * Date.now(),
		authorId: TEMPORARY_COLLECTION_ID_FACTOR,
		isOwner: true,
		isDefault: false,
		createdAt: now,
		updatedAt: now,
		name: input.name,
		description: input.description,
		visibility: input.visibility,
		icon: input.icon ?? null,
		// Placeholder — a new collection is appended (insertCollectionIntoTree),
		// and the resync that always follows a mutation overwrites this with the
		// server's real value before anything reads it for ordering.
		position: 0,
		links: [],
	};
}

export function useCreateCollection() {
	return useCollectionsMutation<CollectionInput>({
		mutationFn: createCollection,
		applyOptimisticUpdate: (collections, input) =>
			insertCollectionIntoTree(collections, toOptimisticCollection(input)),
	});
}
