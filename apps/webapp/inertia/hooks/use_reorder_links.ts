import type { Data } from '@generated/data';

import { urlFor } from '~/lib/tuyau';
import { useOptimisticOrder } from './use_optimistic_order';

export function useReorderLinks(
	collectionId: number,
	serverLinks: Data.Link[]
) {
	const { items, moveAndCommit } = useOptimisticOrder(serverLinks);

	const reorder = (activeId: number, overId: number) => {
		moveAndCommit(
			activeId,
			overId,
			urlFor('collection.reorder-links', { id: collectionId }),
			(linkIds) => ({ linkIds })
		);
	};

	return { links: items, reorder };
}
