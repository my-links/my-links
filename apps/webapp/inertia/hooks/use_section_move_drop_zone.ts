import { useDndContext, useDroppable } from '@dnd-kit/core';

import {
	COLLECTION_SECTION,
	type CollectionSection,
} from '~/lib/dnd/dnd_types';
import { isCollectionDragData, isSectionDropData } from '~/lib/dnd/drag_data';

export function useSectionMoveDropZone(section: CollectionSection) {
	const { active, over } = useDndContext();
	const activeData = active?.data.current;

	const isAcceptingMove =
		section !== COLLECTION_SECTION.FOLLOWED &&
		isCollectionDragData(activeData) &&
		activeData.isOwner &&
		activeData.section !== COLLECTION_SECTION.FOLLOWED &&
		activeData.section !== section;

	const { setNodeRef } = useDroppable({
		id: `section-${section}`,
		data: { kind: 'section', section },
		disabled: !isAcceptingMove,
	});

	const overData = over?.data.current;
	const isHoveredByMove =
		isAcceptingMove &&
		(isSectionDropData(overData) || isCollectionDragData(overData)) &&
		overData.section === section;

	return { setNodeRef, isHoveredByMove };
}
