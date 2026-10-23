import type { Data } from '@generated/data';

import { useOptimisticOrder } from './use_optimistic_order';
import { urlFor } from '~/lib/tuyau';

type CollectionWithLinks = Data.Collection.Variants['withLinks'];

export function useReorderFollowedCollections(
	serverCollections: CollectionWithLinks[]
) {
	const { items, moveAndCommit } = useOptimisticOrder(serverCollections);

	const reorder = (activeId: number, overId: number) => {
		moveAndCommit(
			activeId,
			overId,
			urlFor('collection.reorder-followed'),
			(collectionIds) => ({ collectionIds })
		);
	};

	return { collections: items, reorder };
}
