import type { Data } from '@generated/data';

import { urlFor } from '~/lib/tuyau';
import type { Visibility } from '~/types/visibility';
import { useOptimisticOrder } from './use_optimistic_order';

type CollectionWithLinks = Data.Collection.Variants['withLinks'];

export function useReorderCollections(
	visibility: Visibility,
	serverCollections: CollectionWithLinks[]
) {
	const { items, moveAndCommit } = useOptimisticOrder(serverCollections);

	const reorder = (activeId: number, overId: number) => {
		moveAndCommit(
			activeId,
			overId,
			urlFor('collection.reorder-owned'),
			(collectionIds) => ({ visibility, collectionIds })
		);
	};

	return { collections: items, reorder };
}
