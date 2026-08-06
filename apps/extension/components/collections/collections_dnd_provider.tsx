import { useState } from 'react';
import type { ReactNode } from 'react';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
	type DragStartEvent,
} from '@dnd-kit/core';

import { useCollections } from '@/hooks/use_collections';
import { visibilityForSection } from '@/lib/dnd/dnd_types';
import { useReorderLinks } from '@/hooks/use_reorder_links';
import { useShiftModifier } from '@/hooks/use_shift_modifier';
import { armDragClickGuard } from '@/lib/dnd/drag_click_guard';
import { CollectionsDragOverlay } from './collections_drag_overlay';
import { useReorderCollections } from '@/hooks/use_reorder_collections';
import { isCollectionDragData, isLinkDragData } from '@/lib/dnd/drag_data';
import { useAddLinkToCollection } from '@/hooks/use_add_link_to_collection';
import { useMoveLinkToCollection } from '@/hooks/use_move_link_to_collection';
import { createCollectionsDndAnnouncements } from '@/lib/dnd/dnd_announcements';
import { collectionsDndCollisionDetection } from '@/lib/dnd/collision_detection';

/**
 * Module-level, not inline literals: `useSensor` memoizes on `[sensor,
 * options]` by reference, and a new object reference handed to `<DndContext>`
 * mid-drag resets dnd-kit's internal sensor activation state, silently
 * dropping the gesture in progress (bit the webapp port during its own link
 * drag work — see plan phase 5b).
 */
const POINTER_SENSOR_OPTIONS = { activationConstraint: { distance: 8 } };
const KEYBOARD_SENSOR_OPTIONS = {
	coordinateGetter: sortableKeyboardCoordinates,
};
const ANNOUNCEMENTS = createCollectionsDndAnnouncements();

interface CollectionsDndProviderProps {
	children: ReactNode;
}

export function CollectionsDndProvider({
	children,
}: Readonly<CollectionsDndProviderProps>) {
	const { collections } = useCollections();
	const reorderCollections = useReorderCollections();
	const reorderLinks = useReorderLinks();
	const moveLinkToCollection = useMoveLinkToCollection();
	const addLinkToCollection = useAddLinkToCollection();
	const [activeDragKind, setActiveDragKind] = useState<
		'collection' | 'link' | null
	>(null);
	const { isShiftPressed, isShiftPressedRef } = useShiftModifier(
		activeDragKind === 'link'
	);
	const sensors = useSensors(
		useSensor(PointerSensor, POINTER_SENSOR_OPTIONS),
		useSensor(KeyboardSensor, KEYBOARD_SENSOR_OPTIONS)
	);

	const handleDragStart = (event: DragStartEvent) => {
		const data = event.active.data.current;
		if (isCollectionDragData(data)) {
			setActiveDragKind('collection');
		} else if (isLinkDragData(data)) {
			setActiveDragKind('link');
		}
	};

	const handleCollectionDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over) return;

		const activeData = active.data.current;
		const overData = over.data.current;
		if (!isCollectionDragData(activeData) || !isCollectionDragData(overData)) {
			return;
		}
		if (activeData.collectionId === overData.collectionId) return;

		const visibility = visibilityForSection(activeData.section);
		const sectionCollections = collections
			.filter((collection) => collection.visibility === visibility)
			.sort((a, b) => a.position - b.position);

		const activeIndex = sectionCollections.findIndex(
			(collection) => collection.id === activeData.collectionId
		);
		const overIndex = sectionCollections.findIndex(
			(collection) => collection.id === overData.collectionId
		);
		if (activeIndex === -1 || overIndex === -1) return;

		const reordered = arrayMove(sectionCollections, activeIndex, overIndex);
		reorderCollections.mutate({
			visibility,
			collectionIds: reordered.map((collection) => collection.id),
		});
	};

	const handleLinkDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over) return;

		const activeData = active.data.current;
		if (!isLinkDragData(activeData)) return;

		const overData = over.data.current;

		if (isCollectionDragData(overData)) {
			if (overData.collectionId === activeData.collectionId) return;
			if (isShiftPressedRef.current) {
				addLinkToCollection.mutate({
					linkId: activeData.linkId,
					collectionId: overData.collectionId,
				});
			} else {
				moveLinkToCollection.mutate({
					linkId: activeData.linkId,
					fromCollectionId: activeData.collectionId,
					toCollectionId: overData.collectionId,
				});
			}
			return;
		}

		if (isLinkDragData(overData) && overData.linkId !== activeData.linkId) {
			const collection = collections.find(
				(item) => item.id === activeData.collectionId
			);
			const links = collection?.links ?? [];
			const activeIndex = links.findIndex(
				(link) => link.id === activeData.linkId
			);
			const overIndex = links.findIndex((link) => link.id === overData.linkId);
			if (activeIndex === -1 || overIndex === -1) return;

			const reordered = arrayMove(links, activeIndex, overIndex);
			reorderLinks.mutate({
				collectionId: activeData.collectionId,
				linkIds: reordered.map((link) => link.id),
			});
		}
	};

	const handleDragEnd = (event: DragEndEvent) => {
		armDragClickGuard();
		setActiveDragKind(null);

		const activeData = event.active.data.current;
		if (isCollectionDragData(activeData)) {
			handleCollectionDragEnd(event);
		} else if (isLinkDragData(activeData)) {
			handleLinkDragEnd(event);
		}
	};

	const handleDragCancel = () => {
		armDragClickGuard();
		setActiveDragKind(null);
	};

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={collectionsDndCollisionDetection}
			accessibility={{ announcements: ANNOUNCEMENTS }}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			onDragCancel={handleDragCancel}
		>
			{children}
			<CollectionsDragOverlay isShiftPressed={isShiftPressed} />
		</DndContext>
	);
}
