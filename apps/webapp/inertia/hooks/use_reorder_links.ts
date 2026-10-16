import { urlFor } from '~/lib/tuyau';
import type { DisplayLink } from '~/lib/link';
import { useOptimisticOrder } from './use_optimistic_order';

export function useReorderLinks(
	collectionId: number,
	serverLinks: DisplayLink[]
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
