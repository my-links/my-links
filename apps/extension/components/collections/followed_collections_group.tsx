import clsx from 'clsx';
import { useState } from 'react';
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { armDragClickGuard } from '@/lib/dnd/drag_click_guard';
import { FollowedCollectionSection } from './followed_collection_section';
import { useFollowedCollections } from '@/hooks/use_followed_collections';
import { useReorderFollowedCollections } from '@/hooks/use_reorder_followed_collections';

/**
 * Module-level, not inline literals — see the identical constant in
 * `collections_dnd_provider.tsx`: a new object reference on every render
 * resets dnd-kit's sensor activation state mid-drag.
 */
const POINTER_SENSOR_OPTIONS = { activationConstraint: { distance: 8 } };
const KEYBOARD_SENSOR_OPTIONS = {
	coordinateGetter: sortableKeyboardCoordinates,
};

/**
 * Collapsed by default — a follower opens the extension for their own
 * links far more often than someone else's, and a large followed collection
 * shouldn't push those below the fold on every open. Hidden entirely when
 * the user follows nothing, same as the other empty states in this tree.
 *
 * Runs its own isolated `DndContext` rather than joining
 * `CollectionsDndProvider` — followed collections only ever reorder among
 * themselves (no cross-drop into owned collections, no link dragging), so
 * the shared collision detection tuned for that owned-collection/link
 * interplay doesn't apply here.
 */
export function FollowedCollectionsGroup() {
	const [isExpanded, setIsExpanded] = useState(false);
	const { followedCollections } = useFollowedCollections();
	const reorderFollowedCollections = useReorderFollowedCollections();
	const sensors = useSensors(
		useSensor(PointerSensor, POINTER_SENSOR_OPTIONS),
		useSensor(KeyboardSensor, KEYBOARD_SENSOR_OPTIONS)
	);

	const handleDragEnd = (event: DragEndEvent) => {
		armDragClickGuard();

		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const activeIndex = followedCollections.findIndex(
			(collection) => collection.id === active.id
		);
		const overIndex = followedCollections.findIndex(
			(collection) => collection.id === over.id
		);
		if (activeIndex === -1 || overIndex === -1) return;

		const reordered = arrayMove(followedCollections, activeIndex, overIndex);
		reorderFollowedCollections.mutate({
			collectionIds: reordered.map((collection) => collection.id),
		});
	};

	if (followedCollections.length === 0) {
		return null;
	}

	return (
		<div className="mb-2 border-b border-gray-200 pb-2 dark:border-gray-700">
			<button
				onClick={() => setIsExpanded((previous) => !previous)}
				aria-expanded={isExpanded}
				className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-white/50 dark:hover:bg-gray-800/50"
			>
				<div
					className={clsx(
						'i-ant-design-down-outlined h-3 w-3 flex-shrink-0 text-gray-500 transition-transform',
						!isExpanded && '-rotate-90'
					)}
				/>
				<div className="i-ant-design-team-outlined h-4 w-4 flex-shrink-0 text-gray-500" />
				<span className="flex-1 truncate text-sm font-medium text-gray-700 dark:text-gray-300">
					Followed
				</span>
				<span className="flex-shrink-0 text-xs text-gray-400">
					{followedCollections.length}
				</span>
			</button>
			{isExpanded && (
				<div className="ml-1 space-y-0.5">
					<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
						<SortableContext
							items={followedCollections.map((collection) => collection.id)}
							strategy={verticalListSortingStrategy}
						>
							{followedCollections.map((collection) => (
								<FollowedCollectionSection
									key={collection.id}
									collection={collection}
								/>
							))}
						</SortableContext>
					</DndContext>
				</div>
			)}
		</div>
	);
}
