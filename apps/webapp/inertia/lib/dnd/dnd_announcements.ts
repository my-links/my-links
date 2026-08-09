import { t } from '@lingui/core/macro';
import type { Announcements } from '@dnd-kit/core';

import { COLLECTION_SECTION, type CollectionSection } from './dnd_types';
import {
	isCollectionDragData,
	isLinkDropTargetData,
	isLinkDragData,
} from './drag_data';

function sectionLabel(section: CollectionSection): string {
	switch (section) {
		case COLLECTION_SECTION.FOLLOWED:
			return t`Followed Collections`;
		case COLLECTION_SECTION.PUBLIC:
			return t`My Public Collections`;
		case COLLECTION_SECTION.PRIVATE:
			return t`My Private Collections`;
	}
}

export function createDashboardDndAnnouncements(): Announcements {
	return {
		onDragStart({ active }) {
			const data = active.data.current;
			if (isCollectionDragData(data)) {
				return t`Picked up collection in ${sectionLabel(data.section)}.`;
			}
			if (isLinkDragData(data)) {
				return t`Picked up link.`;
			}
			return undefined;
		},
		onDragOver({ active, over }) {
			const data = active.data.current;
			if (!over) {
				return undefined;
			}
			if (isCollectionDragData(data)) {
				return t`Collection moved within ${sectionLabel(data.section)}.`;
			}
			if (isLinkDragData(data)) {
				const overData = over.data.current;
				if (
					isLinkDropTargetData(overData) &&
					overData.collectionId !== data.collectionId
				) {
					return t`Link over another collection.`;
				}
				return t`Link moved.`;
			}
			return undefined;
		},
		onDragEnd({ active, over }) {
			const data = active.data.current;
			if (isCollectionDragData(data)) {
				if (!over) {
					return t`Reorder cancelled.`;
				}
				return t`Collection order updated in ${sectionLabel(data.section)}.`;
			}
			if (isLinkDragData(data)) {
				if (!over) {
					return t`Reorder cancelled.`;
				}
				const overData = over.data.current;
				if (
					isLinkDropTargetData(overData) &&
					overData.collectionId !== data.collectionId
				) {
					return t`Link filed into another collection.`;
				}
				return t`Link order updated.`;
			}
			return undefined;
		},
		onDragCancel() {
			return t`Reorder cancelled.`;
		},
	};
}
