import { t } from '@lingui/core/macro';
import type { Announcements } from '@dnd-kit/core';

import { isCollectionDragData } from './drag_data';
import { COLLECTION_SECTION, type CollectionSection } from './dnd_types';

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

export function createCollectionDndAnnouncements(): Announcements {
	return {
		onDragStart({ active }) {
			const data = active.data.current;
			if (!isCollectionDragData(data)) {
				return undefined;
			}
			return t`Picked up collection in ${sectionLabel(data.section)}.`;
		},
		onDragOver({ active, over }) {
			const data = active.data.current;
			if (!isCollectionDragData(data) || !over) {
				return undefined;
			}
			return t`Collection moved within ${sectionLabel(data.section)}.`;
		},
		onDragEnd({ active, over }) {
			const data = active.data.current;
			if (!isCollectionDragData(data)) {
				return undefined;
			}
			if (!over) {
				return t`Reorder cancelled.`;
			}
			return t`Collection order updated in ${sectionLabel(data.section)}.`;
		},
		onDragCancel() {
			return t`Reorder cancelled.`;
		},
	};
}
