import type { Data } from '@generated/data';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { createContext, useContext, useState, type ReactNode } from 'react';
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
	type DragStartEvent,
} from '@dnd-kit/core';

import { Visibility } from '~/types/visibility';
import { COLLECTION_SECTION } from '~/lib/dnd/dnd_types';
import { useReorderLinks } from '~/hooks/use_reorder_links';
import { useShiftModifier } from '~/hooks/use_shift_modifier';
import { armDragClickGuard } from '~/lib/dnd/drag_click_guard';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { DashboardDragOverlay } from './dashboard_drag_overlay';
import { useReorderCollections } from '~/hooks/use_reorder_collections';
import { dashboardCollisionDetection } from '~/lib/dnd/collision_detection';
import { useAddLinkToCollection } from '~/hooks/use_add_link_to_collection';
import { useMoveLinkToCollection } from '~/hooks/use_move_link_to_collection';
import { createDashboardDndAnnouncements } from '~/lib/dnd/dnd_announcements';
import { useReorderFollowedCollections } from '~/hooks/use_reorder_followed_collections';
import {
	isCollectionDragData,
	isLinkDropTargetData,
	isLinkDragData,
} from '~/lib/dnd/drag_data';

type CollectionWithLinks = Data.Collection.Variants['withLinks'];

/**
 * Module-level so the reference never changes — `useSensor` memoizes on
 * `[sensor, options]`, and an inline object literal here would invalidate
 * that every render. A re-render mid-drag (e.g. the shift-modifier tracking
 * below) would then hand `<DndContext>` a brand new `sensors` array, which
 * resets its internal sensor activation state and silently drops the
 * in-progress gesture.
 */
const POINTER_SENSOR_OPTIONS = { activationConstraint: { distance: 8 } };
const KEYBOARD_SENSOR_OPTIONS = {
	coordinateGetter: sortableKeyboardCoordinates,
};

type DashboardDndContextValue = {
	followedCollections: CollectionWithLinks[];
	myPublicCollections: CollectionWithLinks[];
	myPrivateCollections: CollectionWithLinks[];
	activeCollectionLinks: Data.Link[];
};

const DashboardDndContext = createContext<DashboardDndContextValue | null>(
	null
);

export function useDashboardDndCollections(): DashboardDndContextValue {
	const context = useContext(DashboardDndContext);
	if (!context) {
		throw new Error(
			'useDashboardDndCollections must be used within DashboardDndProvider'
		);
	}
	return context;
}

export function DashboardDndProvider({
	children,
}: Readonly<{ children: ReactNode }>) {
	const {
		followedCollections: serverFollowed,
		myPublicCollections: serverPublic,
		myPrivateCollections: serverPrivate,
		activeCollection,
	} = useDashboardProps();

	const followed = useReorderFollowedCollections(serverFollowed);
	const publicCollections = useReorderCollections(
		Visibility.PUBLIC,
		serverPublic
	);
	const privateCollections = useReorderCollections(
		Visibility.PRIVATE,
		serverPrivate
	);
	const reorderLinks = useReorderLinks(
		activeCollection?.id ?? 0,
		activeCollection?.links ?? []
	);
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
					followed.reorder(activeId, overId);
					break;
				case COLLECTION_SECTION.PUBLIC:
					publicCollections.reorder(activeId, overId);
					break;
				case COLLECTION_SECTION.PRIVATE:
					privateCollections.reorder(activeId, overId);
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
				reorderLinks.reorder(Number(active.id), Number(over.id));
			}
		}
	};

	const handleDragCancel = () => {
		armDragClickGuard();
		setActiveDragKind(null);
	};

	return (
		<DashboardDndContext.Provider
			value={{
				followedCollections: followed.collections,
				myPublicCollections: publicCollections.collections,
				myPrivateCollections: privateCollections.collections,
				activeCollectionLinks: reorderLinks.links,
			}}
		>
			<DndContext
				sensors={sensors}
				collisionDetection={dashboardCollisionDetection}
				accessibility={{ announcements: createDashboardDndAnnouncements() }}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				onDragCancel={handleDragCancel}
			>
				{children}
				<DashboardDragOverlay isShiftPressed={isShiftPressed} />
			</DndContext>
		</DashboardDndContext.Provider>
	);
}
