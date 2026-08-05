import type { Announcements } from '@dnd-kit/core';

import { isCollectionDragData, isLinkDragData } from './drag_data';
import { COLLECTION_SECTION, type CollectionSection } from './dnd_types';

function sectionLabel(section: CollectionSection): string {
	switch (section) {
		case COLLECTION_SECTION.PUBLIC:
			return 'My Public Collections';
		case COLLECTION_SECTION.PRIVATE:
			return 'My Private Collections';
	}
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
				const overData = over.data.current;
				if (
					isCollectionDragData(overData) &&
					overData.collectionId !== data.collectionId
				) {
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
				const overData = over.data.current;
				if (
					isCollectionDragData(overData) &&
					overData.collectionId !== data.collectionId
				) {
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
