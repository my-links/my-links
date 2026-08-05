import type { ReactNode } from 'react';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from '@dnd-kit/core';

import { useCollections } from '@/hooks/use_collections';
import { isCollectionDragData } from '@/lib/dnd/drag_data';
import { visibilityForSection } from '@/lib/dnd/dnd_types';
import { armDragClickGuard } from '@/lib/dnd/drag_click_guard';
import { CollectionsDragOverlay } from './collections_drag_overlay';
import { useReorderCollections } from '@/hooks/use_reorder_collections';
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
	const sensors = useSensors(
		useSensor(PointerSensor, POINTER_SENSOR_OPTIONS),
		useSensor(KeyboardSensor, KEYBOARD_SENSOR_OPTIONS)
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const activeData = active.data.current;
		if (!isCollectionDragData(activeData)) return;

		const visibility = visibilityForSection(activeData.section);
		const sectionCollections = collections
			.filter((collection) => collection.visibility === visibility)
			.sort((a, b) => a.position - b.position);

		const activeIndex = sectionCollections.findIndex(
			(collection) => collection.id === active.id
		);
		const overIndex = sectionCollections.findIndex(
			(collection) => collection.id === over.id
		);
		if (activeIndex === -1 || overIndex === -1) return;

		const reordered = arrayMove(sectionCollections, activeIndex, overIndex);
		reorderCollections.mutate({
			visibility,
			collectionIds: reordered.map((collection) => collection.id),
		});
	};

	const handleDragEndWithGuard = (event: DragEndEvent) => {
		armDragClickGuard();
		handleDragEnd(event);
	};

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={collectionsDndCollisionDetection}
			accessibility={{ announcements: ANNOUNCEMENTS }}
			onDragEnd={handleDragEndWithGuard}
			onDragCancel={armDragClickGuard}
		>
			{children}
			<CollectionsDragOverlay />
		</DndContext>
	);
}
