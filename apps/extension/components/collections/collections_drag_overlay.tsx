import { DragOverlay, useDndContext } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

import { useCollections } from '@/hooks/use_collections';
import { isCollectionDragData } from '@/lib/dnd/drag_data';

const OVERLAY_MODIFIERS = [restrictToWindowEdges];

export function CollectionsDragOverlay() {
	const { active } = useDndContext();
	const { collections } = useCollections();
	const activeData = active?.data.current;
	const draggedCollection = isCollectionDragData(activeData)
		? collections.find(
				(collection) => collection.id === activeData.collectionId
			)
		: undefined;

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
