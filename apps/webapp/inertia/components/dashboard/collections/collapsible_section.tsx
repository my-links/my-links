import { ReactNode } from 'react';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import type { Data } from '@generated/data';
import { IconButton } from '@minimalstuff/ui';
import {
	SortableContext,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { cn } from '~/lib/cn';
import { useContextMenu } from '~/hooks/use_context_menu';
import type { CollectionSection } from '~/lib/dnd/dnd_types';
import { SortableCollectionItem } from './sortable_collection_item';
import { useSectionCollapseStore } from '~/stores/section_collapse_store';
import { ContextMenu } from '~/components/common/context_menu/context_menu';
import { ContextMenuItem } from '~/components/common/context_menu/context_menu_item';

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
	const {
		menuPosition,
		shouldRender,
		isVisible,
		menuRef,
		menuContentRef,
		toggleMenu,
		closeMenu,
		handleContextMenu,
	} = useContextMenu();

	if (collections.length === 0 && !alwaysShow) {
		return null;
	}

	const isEmpty = collections.length === 0;
	const shouldShowCollapse = canCollapse && !isEmpty;

	const handleMoveUp = () => {
		closeMenu();
		onMoveUp();
	};

	const handleMoveDown = () => {
		closeMenu();
		onMoveDown();
	};

	return (
		<div className={cn('mb-2', isEmpty && 'opacity-40')}>
			<div
				ref={menuRef}
				onContextMenu={handleContextMenu}
				className="relative flex items-center w-full mb-1 rounded transition-colors gap-1 group hover:bg-white/50 dark:hover:bg-gray-800/50"
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
							toggleMenu(e);
						}}
						aria-label={t`Section options`}
					/>
				</div>
				<ContextMenu
					isVisible={isVisible}
					shouldRender={shouldRender}
					menuPosition={menuPosition}
					menuContentRef={menuContentRef}
				>
					<ContextMenuItem
						icon="i-ant-design-up-outlined"
						onClick={handleMoveUp}
						disabled={!canMoveUp}
					>
						<Trans>Move up</Trans>
					</ContextMenuItem>
					<ContextMenuItem
						icon="i-ant-design-down-outlined"
						onClick={handleMoveDown}
						disabled={!canMoveDown}
					>
						<Trans>Move down</Trans>
					</ContextMenuItem>
				</ContextMenu>
			</div>
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
