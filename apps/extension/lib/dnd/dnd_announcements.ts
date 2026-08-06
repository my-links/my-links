import type { Announcements } from '@dnd-kit/core';

import {
	COLLECTION_SECTION,
	type CollectionSection,
	type LinkDragData,
} from './dnd_types';
import {
	collectionIdForDropTarget,
	isCollectionDragData,
	isLinkDragData,
} from './drag_data';

function sectionLabel(section: CollectionSection): string {
	switch (section) {
		case COLLECTION_SECTION.FOLLOWED:
			return 'Followed Collections';
		case COLLECTION_SECTION.PUBLIC:
			return 'My Public Collections';
		case COLLECTION_SECTION.PRIVATE:
			return 'My Private Collections';
	}
}

function isFilingIntoAnotherCollection(
	activeData: LinkDragData,
	overData: unknown
): boolean {
	const overCollectionId = collectionIdForDropTarget(overData);
	return (
		overCollectionId !== undefined &&
		overCollectionId !== activeData.collectionId
	);
}

export function createCollectionsDndAnnouncements(): Announcements {
	return {
		onDragStart({ active }) {
			const data = active.data.current;
			if (isCollectionDragData(data)) {
				return `Picked up collection in ${sectionLabel(data.section)}.`;
			}
			if (isLinkDragData(data)) {
				return 'Picked up link.';
			}
			return undefined;
		},
		onDragOver({ active, over }) {
			const data = active.data.current;
			if (!over) {
				return undefined;
			}
			if (isCollectionDragData(data)) {
				return `Collection moved within ${sectionLabel(data.section)}.`;
			}
			if (isLinkDragData(data)) {
				if (isFilingIntoAnotherCollection(data, over.data.current)) {
					return 'Link over another collection.';
				}
				return 'Link moved.';
			}
			return undefined;
		},
		onDragEnd({ active, over }) {
			const data = active.data.current;
			if (isCollectionDragData(data)) {
				if (!over) {
					return 'Reorder cancelled.';
				}
				return `Collection order updated in ${sectionLabel(data.section)}.`;
			}
			if (isLinkDragData(data)) {
				if (!over) {
					return 'Reorder cancelled.';
				}
				if (isFilingIntoAnotherCollection(data, over.data.current)) {
					return 'Link filed into another collection.';
				}
				return 'Link order updated.';
			}
			return undefined;
		},
		onDragCancel() {
			return 'Reorder cancelled.';
		},
	};
}
