import type { CollisionDetection } from '@dnd-kit/core';
import { closestCenter, pointerWithin } from '@dnd-kit/core';

import {
	isCollectionDragData,
	isInboxDropData,
	isLinkDragData,
} from './drag_data';

/**
 * Restricts collision candidates by what's actually being dragged:
 * a collection can only land in its own sidebar section (a cross-section
 * drop would be an implicit visibility change, rejected server-side anyway),
 * which also keeps the sectionless pinned Inbox out of its candidates;
 * a link checks sidebar collections first (only owned ones — a followed
 * collection isn't a legal drop target) plus the pinned Inbox, and falls back
 * to its own link list for in-collection reordering.
 */
export const dashboardCollisionDetection: CollisionDetection = (args) => {
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
		const ownedCollectionContainers = args.droppableContainers.filter(
			(container) => {
				const containerData = container.data.current;
				if (isInboxDropData(containerData)) {
					return true;
				}
				return isCollectionDragData(containerData) && containerData.isOwner;
			}
		);
		const collectionHits = pointerWithin({
			...args,
			droppableContainers: ownedCollectionContainers,
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
