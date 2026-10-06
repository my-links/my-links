import { useState } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';

import { COLLECTION_SECTION } from '~/lib/dnd/dnd_types';
import { useShiftModifier } from '~/hooks/use_shift_modifier';
import { armDragClickGuard } from '~/lib/dnd/drag_click_guard';
import { useAddLinkToCollection } from '~/hooks/use_add_link_to_collection';
import { useMoveLinkToCollection } from '~/hooks/use_move_link_to_collection';
import {
	isCollectionDragData,
	isLinkDropTargetData,
	isLinkDragData,
} from '~/lib/dnd/drag_data';

type Reorder = (activeId: number, overId: number) => void;

type DashboardReorderers = {
	followed: Reorder;
	publicCollections: Reorder;
	privateCollections: Reorder;
	links: Reorder;
};

type UseDashboardDragHandlersReturn = {
	isShiftPressed: boolean;
	handleDragStart: (event: DragStartEvent) => void;
	handleDragEnd: (event: DragEndEvent) => void;
	handleDragCancel: () => void;
};

export function useDashboardDragHandlers(
	reorderers: DashboardReorderers
): UseDashboardDragHandlersReturn {
	const moveLinkToCollection = useMoveLinkToCollection();
	const addLinkToCollection = useAddLinkToCollection();

	const [activeDragKind, setActiveDragKind] = useState<
		'collection' | 'link' | null
	>(null);
	const { isShiftPressed, isShiftPressedRef } = useShiftModifier(
		activeDragKind === 'link'
	);

	const handleDragStart = (event: DragStartEvent) => {
		const data = event.active.data.current;
		if (isCollectionDragData(data)) {
			setActiveDragKind('collection');
		} else if (isLinkDragData(data)) {
			setActiveDragKind('link');
		}
	};

	const handleDragEnd = (event: DragEndEvent) => {
		armDragClickGuard();
		setActiveDragKind(null);

		const { active, over } = event;
		if (!over) {
			return;
		}

		const activeData = active.data.current;

		if (isCollectionDragData(activeData)) {
			if (active.id === over.id) {
				return;
			}
			const activeId = Number(active.id);
			const overId = Number(over.id);
			switch (activeData.section) {
				case COLLECTION_SECTION.FOLLOWED:
					reorderers.followed(activeId, overId);
					break;
				case COLLECTION_SECTION.PUBLIC:
					reorderers.publicCollections(activeId, overId);
					break;
				case COLLECTION_SECTION.PRIVATE:
					reorderers.privateCollections(activeId, overId);
					break;
			}
			return;
		}

		if (isLinkDragData(activeData)) {
			const overData = over.data.current;

			if (isLinkDropTargetData(overData)) {
				if (overData.collectionId === activeData.collectionId) {
					return;
				}
				if (isShiftPressedRef.current) {
					addLinkToCollection(activeData.linkId, overData.collectionId);
				} else {
					moveLinkToCollection(
						activeData.linkId,
						activeData.collectionId,
						overData.collectionId
					);
				}
				return;
			}

			if (isLinkDragData(overData) && active.id !== over.id) {
				reorderers.links(Number(active.id), Number(over.id));
			}
		}
	};

	const handleDragCancel = () => {
		armDragClickGuard();
		setActiveDragKind(null);
	};

	return { isShiftPressed, handleDragStart, handleDragEnd, handleDragCancel };
}
