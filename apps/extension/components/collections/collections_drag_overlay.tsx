import clsx from 'clsx';
import { DragOverlay, useDndContext } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

import { useCollections } from '@/hooks/use_collections';
import { useFollowedCollections } from '@/hooks/use_followed_collections';
import {
	collectionIdForDropTarget,
	isCollectionDragData,
	isLinkDragData,
} from '@/lib/dnd/drag_data';

const OVERLAY_MODIFIERS = [restrictToWindowEdges];

interface CollectionsDragOverlayProps {
	isShiftPressed: boolean;
}

export function CollectionsDragOverlay({
	isShiftPressed,
}: Readonly<CollectionsDragOverlayProps>) {
	const { active, over } = useDndContext();
	const { collections } = useCollections();
	const { followedCollections } = useFollowedCollections();
	const activeData = active?.data.current;

	if (active && isCollectionDragData(activeData)) {
		const draggedCollection = (
			activeData.isOwner ? collections : followedCollections
		).find((collection) => collection.id === activeData.collectionId);

		return (
			<DragOverlay modifiers={OVERLAY_MODIFIERS}>
				{draggedCollection && (
					<div className="flex items-center gap-2 rounded-md bg-white px-2 py-1.5 shadow-lg dark:bg-gray-800">
						{draggedCollection.icon ? (
							<span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-base">
								{draggedCollection.icon}
							</span>
						) : draggedCollection.isDefault ? (
							<div className="i-ant-design-inbox-outlined h-5 w-5 flex-shrink-0 text-gray-500" />
						) : (
							<div className="i-ant-design-folder-outlined h-5 w-5 flex-shrink-0 text-gray-500" />
						)}
						<span className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
							{draggedCollection.name}
						</span>
					</div>
				)}
			</DragOverlay>
		);
	}

	if (active && isLinkDragData(activeData)) {
		const draggedLink = collections
			.flatMap((collection) => collection.links ?? [])
			.find((link) => link.id === activeData.linkId);
		const overCollectionId = collectionIdForDropTarget(over?.data.current);
		const isOverAnotherCollection =
			overCollectionId !== undefined &&
			overCollectionId !== activeData.collectionId;

		return (
			<DragOverlay modifiers={OVERLAY_MODIFIERS}>
				{draggedLink && (
					<div className="relative flex items-center gap-2 rounded-md bg-white px-2 py-1.5 shadow-lg dark:bg-gray-800">
						<span className="truncate text-sm text-gray-700 dark:text-gray-300">
							{draggedLink.name}
						</span>
						{isOverAnotherCollection && (
							<span
								className={clsx(
									'absolute -top-2 -right-2 rounded px-1.5 py-0.5 text-xs font-medium shadow',
									isShiftPressed
										? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
										: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
								)}
							>
								{isShiftPressed ? 'Add' : 'Move'}
							</span>
						)}
					</div>
				)}
			</DragOverlay>
		);
	}

	return <DragOverlay modifiers={OVERLAY_MODIFIERS}>{null}</DragOverlay>;
}
