import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';

type WithId = { id: number };

type ReorderPayload = Record<string, string | number[]>;

/**
 * A drop that visually snaps back while waiting on the server is worse than
 * no feature — this seeds local state from the server props, applies a
 * reorder immediately, and rolls back only if the request actually fails.
 * `preserveState: true` on the commit is required: without it Inertia
 * remounts the page and the optimistic order is lost mid-flight.
 */
export function useOptimisticOrder<TItem extends WithId>(serverItems: TItem[]) {
	const [items, setItems] = useState(serverItems);

	useEffect(() => {
		setItems(serverItems);
	}, [serverItems]);

	const moveAndCommit = (
		activeId: number,
		overId: number,
		url: string,
		buildPayload: (orderedIds: number[]) => ReorderPayload
	) => {
		const activeIndex = items.findIndex((item) => item.id === activeId);
		const overIndex = items.findIndex((item) => item.id === overId);
		if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
			return;
		}

		const previousItems = items;
		const reorderedItems = arrayMove(items, activeIndex, overIndex);
		setItems(reorderedItems);

		router.put(url, buildPayload(reorderedItems.map((item) => item.id)), {
			preserveScroll: true,
			preserveState: true,
			onError: () => setItems(previousItems),
		});
	};

	return { items, moveAndCommit };
}
