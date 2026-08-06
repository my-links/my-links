import type { CollisionDetection } from '@dnd-kit/core';
import { closestCenter, pointerWithin } from '@dnd-kit/core';

import { isCollectionDragData, isLinkDragData } from './drag_data';

/**
 * Restricts collision candidates by what's actually being dragged: a
 * collection can only land in its own section (a cross-section drop would be
 * an implicit visibility change, rejected server-side anyway); a link picks
 * the innermost target under the pointer, then falls back to its own list.
 *
 * Innermost first matters because a collection's droppable node wraps its
 * link rows: checking collection containers first made every hover over a
 * sibling row resolve to the surrounding collection, so an in-collection
 * reorder could never be expressed. A link only ever considers *owned*
 * collection containers — a followed collection isn't a legal drop target,
 * the follower doesn't manage its contents (see `isOwner` on
 * `CollectionDragData`).
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

		// An expanded collection's rect spans all of its links, so its center can
		// sit hundreds of pixels from the row being aimed at: what the pointer is
		// actually over beats center distance, which only serves keyboard drags
		// (no pointer coordinates) and the gaps between sections.
		const pointerHits = pointerWithin({
			...args,
			droppableContainers: sameSectionContainers,
		});
		if (pointerHits.length > 0) {
			return pointerHits;
		}

		return closestCenter({
			...args,
			droppableContainers: sameSectionContainers,
		});
	}

	if (isLinkDragData(activeData)) {
		const linkContainers = args.droppableContainers.filter((container) =>
			isLinkDragData(container.data.current)
		);
		const linkHits = pointerWithin({
			...args,
			droppableContainers: linkContainers,
		});
		if (linkHits.length > 0) {
			return linkHits;
		}

		const collectionContainers = args.droppableContainers.filter(
			(container) => {
				const containerData = container.data.current;
				return isCollectionDragData(containerData) && containerData.isOwner;
			}
		);
		const collectionHits = pointerWithin({
			...args,
			droppableContainers: collectionContainers,
		});
		if (collectionHits.length > 0) {
			return collectionHits;
		}

		// Pointer outside every container: the only sane guess is the dragged
		// link's own list, never a foreign collection it merely drifted near.
		const siblingLinkContainers = linkContainers.filter((container) => {
			const containerData = container.data.current;
			return (
				isLinkDragData(containerData) &&
				containerData.collectionId === activeData.collectionId
			);
		});
		return closestCenter({
			...args,
			droppableContainers: siblingLinkContainers,
		});
	}

	return closestCenter(args);
};
