import type { ReactNode } from 'react';
import type { Data } from '@generated/data';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';

import { useReorderLinks } from '~/hooks/use_reorder_links';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { DashboardDragOverlay } from './dashboard_drag_overlay';
import { useReorderCollections } from '~/hooks/use_reorder_collections';
import { dashboardCollisionDetection } from '~/lib/dnd/collision_detection';
import { createDashboardDndAnnouncements } from '~/lib/dnd/dnd_announcements';
import { useDashboardDragHandlers } from '~/hooks/use_dashboard_drag_handlers';
import { DashboardDndContext } from '~/components/dashboard/dnd/dashboard_dnd_context';
import { useReorderFollowedCollections } from '~/hooks/use_reorder_followed_collections';

/**
 * Module-level so the reference never changes: `useSensor` memoizes on
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

// Stable reference: an inline `[]` fallback below would change identity every
// render and retrigger useOptimisticOrder's sync effect forever.
const EMPTY_LINKS: Data.Link[] = [];

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
	const publicCollections = useReorderCollections('PUBLIC', serverPublic);
	const privateCollections = useReorderCollections('PRIVATE', serverPrivate);
	const reorderLinks = useReorderLinks(
		activeCollection?.id ?? 0,
		activeCollection?.links ?? EMPTY_LINKS
	);
	const { isShiftPressed, handleDragStart, handleDragEnd, handleDragCancel } =
		useDashboardDragHandlers({
			followed: followed.reorder,
			publicCollections: publicCollections.reorder,
			privateCollections: privateCollections.reorder,
			links: reorderLinks.reorder,
		});

	const sensors = useSensors(
		useSensor(PointerSensor, POINTER_SENSOR_OPTIONS),
		useSensor(KeyboardSensor, KEYBOARD_SENSOR_OPTIONS)
	);

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
