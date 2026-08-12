import { Trans } from '@lingui/react/macro';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { DragOverlay, useDndContext } from '@dnd-kit/core';

import { cn } from '~/lib/cn';
import { useLayoutStore } from '~/stores/layout_store';
import { LinkItem } from '~/components/dashboard/links/link_item';
import { useDashboardDndCollections } from './dashboard_dnd_provider';
import {
	isCollectionDragData,
	isLinkDropTargetData,
	isLinkDragData,
} from '~/lib/dnd/drag_data';

interface DashboardDragOverlayProps {
	isShiftPressed: boolean;
}

// Module-level so the array reference never changes across renders.
const OVERLAY_MODIFIERS = [restrictToWindowEdges];

export function DashboardDragOverlay({
	isShiftPressed,
}: Readonly<DashboardDragOverlayProps>) {
	const { active, over } = useDndContext();
	const { layout } = useLayoutStore('dashboard');
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
			<DragOverlay modifiers={OVERLAY_MODIFIERS}>
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
			isLinkDropTargetData(overData) &&
			overData.collectionId !== activeData.collectionId;
		// Matches the card's own width so the overlay doesn't fall back to
		// whatever intrinsic width LinkItem gets outside of its grid/compact
		// column — a plain pill here was the actual bug: it looked the same
		// in every layout instead of mirroring the one being dragged from.
		const width = active.rect.current.initial?.width;

		return (
			<DragOverlay modifiers={OVERLAY_MODIFIERS}>
				{link ? (
					<div
						className="relative shadow-lg"
						style={width ? { width } : undefined}
					>
						<LinkItem link={link} layout={layout} hideMenu />
						{isOverAnotherCollection && (
							<span
								className={cn(
									'absolute -top-2 -right-2 rounded px-1.5 py-0.5 text-xs font-medium shadow',
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

	return <DragOverlay modifiers={OVERLAY_MODIFIERS}>{null}</DragOverlay>;
}
