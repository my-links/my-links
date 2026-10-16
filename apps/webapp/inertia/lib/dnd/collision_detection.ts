import type { CollisionDetection } from '@dnd-kit/core';
import { closestCenter, pointerWithin } from '@dnd-kit/core';

import { COLLECTION_SECTION, type CollectionSection } from './dnd_types';
import {
	isCollectionDragData,
	isInboxDropData,
	isLinkDragData,
	isSectionDropData,
} from './drag_data';

function hoveredOwnedSection(
	args: Parameters<CollisionDetection>[0]
): CollectionSection | null {
	const zoneContainers = args.droppableContainers.filter((container) =>
		isSectionDropData(container.data.current)
	);
	const [hit] = pointerWithin({ ...args, droppableContainers: zoneContainers });
	const hitData = zoneContainers.find((container) => container.id === hit?.id)
		?.data.current;
	return isSectionDropData(hitData) ? hitData.section : null;
}

function detectOwnedCollectionCollision(
	args: Parameters<CollisionDetection>[0],
	activeSection: CollectionSection
) {
	const targetSection = hoveredOwnedSection(args) ?? activeSection;
	const sectionContainers = args.droppableContainers.filter((container) => {
		const containerData = container.data.current;
		return (
			isCollectionDragData(containerData) &&
			containerData.section === targetSection
		);
	});

	if (sectionContainers.length === 0 && targetSection !== activeSection) {
		return pointerWithin({
			...args,
			droppableContainers: args.droppableContainers.filter((container) =>
				isSectionDropData(container.data.current)
			),
		});
	}

	return closestCenter({ ...args, droppableContainers: sectionContainers });
}

/**
 * Restricts collision candidates by what's actually being dragged:
 * a followed collection can only land in its own sidebar section, and an
 * owned one may also cross to the other owned section (a visibility change,
 * the pointer picks the section), which keeps the pinned Inbox out of both;
 * a link checks sidebar collections first (only owned ones: a followed
 * collection isn't a legal drop target) plus the pinned Inbox, and falls back
 * to its own link list for in-collection reordering.
 */
export const dashboardCollisionDetection: CollisionDetection = (args) => {
	const activeData = args.active.data.current;

	if (
		isCollectionDragData(activeData) &&
		activeData.isOwner &&
		activeData.section !== COLLECTION_SECTION.FOLLOWED
	) {
		return detectOwnedCollectionCollision(args, activeData.section);
	}

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
