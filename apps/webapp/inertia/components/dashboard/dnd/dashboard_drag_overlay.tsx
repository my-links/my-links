import clsx from 'clsx';
import { Trans } from '@lingui/react/macro';
import { DragOverlay, useDndContext } from '@dnd-kit/core';

import { useDashboardDndCollections } from './dashboard_dnd_provider';
import { isCollectionDragData, isLinkDragData } from '~/lib/dnd/drag_data';

interface DashboardDragOverlayProps {
	isShiftPressed: boolean;
}

export function DashboardDragOverlay({
	isShiftPressed,
}: Readonly<DashboardDragOverlayProps>) {
	const { active, over } = useDndContext();
	const {
		followedCollections,
		myPublicCollections,
		myPrivateCollections,
		activeCollectionLinks,
	} = useDashboardDndCollections();

	const activeData = active?.data.current;

	if (active && isCollectionDragData(activeData)) {
		const collection = [
			...followedCollections,
			...myPublicCollections,
			...myPrivateCollections,
		].find((item) => item.id === activeData.collectionId);

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

	if (active && isLinkDragData(activeData)) {
		const link = activeCollectionLinks.find(
			(item) => item.id === activeData.linkId
		);
		const overData = over?.data.current;
		const isOverAnotherCollection =
			isCollectionDragData(overData) &&
			overData.collectionId !== activeData.collectionId;

		return (
			<DragOverlay>
				{link ? (
					<div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200/50 dark:border-gray-700/50 max-w-xs">
						<span className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
							{link.name}
						</span>
						{isOverAnotherCollection && (
							<span
								className={clsx(
									'flex-shrink-0 rounded px-1.5 py-0.5 text-xs font-medium',
									isShiftPressed
										? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
										: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
								)}
							>
								{isShiftPressed ? <Trans>Add</Trans> : <Trans>Move</Trans>}
							</span>
						)}
					</div>
				) : null}
			</DragOverlay>
		);
	}

	return <DragOverlay>{null}</DragOverlay>;
}
