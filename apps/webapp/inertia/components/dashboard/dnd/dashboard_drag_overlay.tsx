import { DragOverlay, useDndContext } from '@dnd-kit/core';

import { isCollectionDragData } from '~/lib/dnd/drag_data';
import { useDashboardDndCollections } from './dashboard_dnd_provider';

export function DashboardDragOverlay() {
	const { active } = useDndContext();
	const { followedCollections, myPublicCollections, myPrivateCollections } =
		useDashboardDndCollections();

	const activeData = active?.data.current;
	const collection =
		active && isCollectionDragData(activeData)
			? [
					...followedCollections,
					...myPublicCollections,
					...myPrivateCollections,
				].find((item) => item.id === activeData.collectionId)
			: undefined;

	return (
		<DragOverlay>
			{collection ? (
				<div className="flex items-center gap-3 px-4 py-2 rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
					{collection.icon ? (
						<span className="text-lg flex-shrink-0 w-5 h-5 flex items-center justify-center">
							{collection.icon}
						</span>
					) : (
						<div className="w-5 h-5 flex-shrink-0 i-ant-design-folder-outlined" />
					)}
					<span className="truncate">{collection.name}</span>
				</div>
			) : null}
		</DragOverlay>
	);
}
