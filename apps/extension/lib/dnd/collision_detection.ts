import type { CollisionDetection } from '@dnd-kit/core';
import { closestCenter, pointerWithin } from '@dnd-kit/core';

import { isCollectionDragData, isLinkDragData } from './drag_data';

/**
 * Restricts collision candidates by what's actually being dragged: a
 * collection can only land in its own section (a cross-section drop would be
 * an implicit visibility change, rejected server-side anyway); a link checks
 * collection containers first (every registered one is owned — followed
 * collections never register as droppable, see dnd_types.ts) and falls back
 * to its own link list for in-collection reordering.
 */
export const collectionsDndCollisionDetection: CollisionDetection = (args) => {
	const activeData = args.active.data.current;

	if (isCollectionDragData(activeData)) {
		const sameSectionContainers = args.droppableContainers.filter(
			(container) => {
				const containerData = container.data.current;
				return (
					isCollectionDragData(containerData) &&
					containerData.section === activeData.section
				);
			}
		);

		return closestCenter({
			...args,
			droppableContainers: sameSectionContainers,
		});
	}

	if (isLinkDragData(activeData)) {
		const collectionContainers = args.droppableContainers.filter((container) =>
			isCollectionDragData(container.data.current)
		);
		const collectionHits = pointerWithin({
			...args,
			droppableContainers: collectionContainers,
		});
		if (collectionHits.length > 0) {
			return collectionHits;
		}

		const linkContainers = args.droppableContainers.filter((container) =>
			isLinkDragData(container.data.current)
		);
		return closestCenter({ ...args, droppableContainers: linkContainers });
	}

	return closestCenter(args);
};
