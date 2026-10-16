import { useState } from 'react';
import type {
	ClientRect,
	DragEndEvent,
	DragStartEvent,
	Over,
} from '@dnd-kit/core';

import { useShiftModifier } from '~/hooks/use_shift_modifier';
import { armDragClickGuard } from '~/lib/dnd/drag_click_guard';
import type { SectionMovePlacement } from '~/lib/collection_section_move';
import { useAddLinkToCollection } from '~/hooks/use_add_link_to_collection';
import { useMoveLinkToCollection } from '~/hooks/use_move_link_to_collection';
import {
	COLLECTION_SECTION,
	type CollectionDragData,
} from '~/lib/dnd/dnd_types';
import type { MoveCollectionToSection } from '~/hooks/use_move_collection_to_section';
import {
	isCollectionDragData,
	isLinkDropTargetData,
	isLinkDragData,
	isSectionDropData,
} from '~/lib/dnd/drag_data';

function resolvePlacement(
	activeRect: ClientRect | null,
	overRect: ClientRect
): SectionMovePlacement {
	if (!activeRect) return 'before';
	const activeCenterY = activeRect.top + activeRect.height / 2;
	const overCenterY = overRect.top + overRect.height / 2;
	return activeCenterY > overCenterY ? 'after' : 'before';
}

type Reorder = (activeId: number, overId: number) => void;

type DashboardReorderers = {
	followed: Reorder;
	publicCollections: Reorder;
	privateCollections: Reorder;
	links: Reorder;
	moveCollectionToSection: MoveCollectionToSection;
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

	const reorderCollection = (
		activeData: CollectionDragData,
		activeId: number,
		over: Over,
		activeRect: ClientRect | null
	) => {
		const overId = Number(over.id);
		const overData = over.data.current;
		const isOverSectionZone = isSectionDropData(overData);
		const overSection =
			isOverSectionZone || isCollectionDragData(overData)
				? overData.section
				: activeData.section;

		if (overSection !== activeData.section) {
			reorderers.moveCollectionToSection(
				activeId,
				activeData.section,
				overSection,
				isOverSectionZone ? null : overId,
				resolvePlacement(activeRect, over.rect)
			);
			return;
		}

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
			if (active.id !== over.id) {
				reorderCollection(
					activeData,
					Number(active.id),
					over,
					active.rect.current.translated
				);
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
