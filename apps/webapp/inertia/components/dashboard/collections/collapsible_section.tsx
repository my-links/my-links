import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import type { Data } from '@generated/data';
import { ContextMenu, IconButton, MenuItem } from '@minimalstuff/ui';
import { ReactNode, useRef, type MouseEvent as ReactMouseEvent } from 'react';
import {
	SortableContext,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { cn } from '~/lib/cn';
import { useSidebarMode } from '~/hooks/use_sidebar_mode';
import type { CollectionSection } from '~/lib/dnd/dnd_types';
import { SortableCollectionItem } from './sortable_collection_item';
import { useSectionCollapseStore } from '~/stores/section_collapse_store';

type CollectionWithLinks = Data.Collection.Variants['withLinks'];

interface CollapsibleSectionProps {
	title: ReactNode;
	collections: CollectionWithLinks[];
	section: CollectionSection;
	canCollapse?: boolean;
	alwaysShow?: boolean;
	canMoveUp: boolean;
	canMoveDown: boolean;
	onMoveUp: () => void;
	onMoveDown: () => void;
}

export function CollapsibleSection({
	title,
	collections,
	section,
	canCollapse = true,
	alwaysShow = false,
	canMoveUp,
	canMoveDown,
	onMoveUp,
	onMoveDown,
}: Readonly<CollapsibleSectionProps>) {
	const isExpanded = useSectionCollapseStore(
		(state) => state.expanded[section]
	);
	const toggleSection = useSectionCollapseStore((state) => state.toggleSection);
	const isRail = useSidebarMode() === 'rail';
	const menuRef = useRef<HTMLDivElement>(null);

	if (collections.length === 0 && !alwaysShow) {
		return null;
	}

	const isEmpty = collections.length === 0;
	const shouldShowCollapse = canCollapse && !isEmpty;

	// A rail has no room for the section header, so it shows a rule instead.
	// Items ignore `isExpanded` there: without a header there is nothing left
	// to expand a collapsed section with, and its collections would be stranded.
	if (isRail) {
		if (isEmpty) return null;

		return (
			<div className="mb-2 space-y-1">
				<hr className="mx-3 my-2 border-gray-200/50 dark:border-gray-700/50" />
				<SortableContext
					items={collections.map((collection) => collection.id)}
					strategy={verticalListSortingStrategy}
				>
					{collections.map((collection) => (
						<SortableCollectionItem
							key={collection.id}
							collection={collection}
							section={section}
						/>
					))}
				</SortableContext>
			</div>
		);
	}

	const handleMoveUp = (e: ReactMouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		onMoveUp();
	};

	const handleMoveDown = (e: ReactMouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		onMoveDown();
	};

	return (
		<div className={cn('mb-2', isEmpty && 'opacity-40')}>
			<ContextMenu
				ref={menuRef}
				className="relative flex items-center w-full mb-1 rounded transition-colors gap-1 group hover:bg-white/50 dark:hover:bg-gray-800/50"
				items={
					<>
						<MenuItem
							icon="i-ant-design-up-outlined"
							onClick={handleMoveUp}
							disabled={!canMoveUp}
						>
							<Trans>Move up</Trans>
						</MenuItem>
						<MenuItem
							icon="i-ant-design-down-outlined"
							onClick={handleMoveDown}
							disabled={!canMoveDown}
						>
							<Trans>Move down</Trans>
						</MenuItem>
					</>
				}
			>
				<button
					onClick={() => shouldShowCollapse && toggleSection(section)}
					disabled={!shouldShowCollapse}
					className={cn(
						'flex items-center gap-1.5 flex-1 min-w-0 rounded transition-colors py-2 px-4',
						shouldShowCollapse ? 'cursor-pointer' : 'cursor-default'
					)}
					aria-label={
						shouldShowCollapse
							? isExpanded
								? t`Collapse`
								: t`Expand`
							: undefined
					}
				>
					<span className="text-sm text-gray-600 dark:text-gray-400 font-medium truncate">
						{title}
					</span>
					{shouldShowCollapse && (
						<div
							className={cn(
								'i-ant-design-caret-down-filled w-3.5 h-3.5 flex-shrink-0 opacity-25 transition-transform text-gray-600 dark:text-gray-400',
								!isExpanded && 'transform rotate-90'
							)}
						/>
					)}
				</button>
				<div
					className={cn(
						'pointer-events-none absolute inset-y-0 right-0 flex items-center py-1 pl-8 pr-4',
						'bg-gradient-to-l from-gray-50 via-gray-50/90 to-transparent dark:from-gray-900 dark:via-gray-900/90',
						'opacity-0 transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto'
					)}
				>
					<IconButton
						icon="i-mdi-dots-vertical"
						size="sm"
						onClick={(e) => {
							e.stopPropagation();
							menuRef.current?.dispatchEvent(
								new MouseEvent('contextmenu', {
									bubbles: true,
									cancelable: true,
									clientX: e.clientX,
									clientY: e.clientY,
								})
							);
						}}
						aria-label={t`Section options`}
					/>
				</div>
			</ContextMenu>
			{isExpanded && (
				<div className="space-y-1">
					<SortableContext
						items={collections.map((collection) => collection.id)}
						strategy={verticalListSortingStrategy}
					>
						{collections.map((collection) => (
							<SortableCollectionItem
								key={collection.id}
								collection={collection}
								section={section}
							/>
						))}
					</SortableContext>
				</div>
			)}
		</div>
	);
}
