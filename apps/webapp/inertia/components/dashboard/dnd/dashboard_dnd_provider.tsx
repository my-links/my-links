import type { Data } from '@generated/data';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { createContext, useContext, type ReactNode } from 'react';
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from '@dnd-kit/core';

import { Visibility } from '~/types/visibility';
import { COLLECTION_SECTION } from '~/lib/dnd/dnd_types';
import { isCollectionDragData } from '~/lib/dnd/drag_data';
import { armDragClickGuard } from '~/lib/dnd/drag_click_guard';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { DashboardDragOverlay } from './dashboard_drag_overlay';
import { useReorderCollections } from '~/hooks/use_reorder_collections';
import { dashboardCollisionDetection } from '~/lib/dnd/collision_detection';
import { createCollectionDndAnnouncements } from '~/lib/dnd/dnd_announcements';
import { useReorderFollowedCollections } from '~/hooks/use_reorder_followed_collections';

type CollectionWithLinks = Data.Collection.Variants['withLinks'];

type DashboardDndContextValue = {
	followedCollections: CollectionWithLinks[];
	myPublicCollections: CollectionWithLinks[];
	myPrivateCollections: CollectionWithLinks[];
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

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragEnd = (event: DragEndEvent) => {
		armDragClickGuard();

		const { active, over } = event;
		if (!over || active.id === over.id) {
			return;
		}

		const activeData = active.data.current;
		if (!isCollectionDragData(activeData)) {
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
	};

	return (
		<DashboardDndContext.Provider
			value={{
				followedCollections: followed.collections,
				myPublicCollections: publicCollections.collections,
				myPrivateCollections: privateCollections.collections,
			}}
		>
			<DndContext
				sensors={sensors}
				collisionDetection={dashboardCollisionDetection}
				accessibility={{ announcements: createCollectionDndAnnouncements() }}
				onDragEnd={handleDragEnd}
				onDragCancel={armDragClickGuard}
			>
				{children}
				<DashboardDragOverlay />
			</DndContext>
		</DashboardDndContext.Provider>
	);
}
