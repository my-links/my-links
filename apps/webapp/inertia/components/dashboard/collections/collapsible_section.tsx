import clsx from 'clsx';
import { ReactNode } from 'react';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import type { Data } from '@generated/data';
import { IconButton } from '@minimalstuff/ui';
import {
	SortableContext,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';

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

	const shouldShowCollapse = canCollapse;

	const handleMoveUp = () => {
		closeMenu();
		onMoveUp();
	};

	const handleMoveDown = () => {
		closeMenu();
		onMoveDown();
	};

	return (
		<div className="mb-2">
			<div
				ref={menuRef}
				onContextMenu={handleContextMenu}
				className="flex items-center justify-between w-full px-2 py-1.5 mb-1 rounded transition-colors gap-1 group"
			>
				<button
					onClick={() => shouldShowCollapse && toggleSection(section)}
					disabled={!shouldShowCollapse}
					className={clsx(
						'flex items-center gap-1.5 flex-1 min-w-0 rounded transition-colors',
						shouldShowCollapse &&
							'hover:bg-white/50 dark:hover:bg-gray-800/50 cursor-pointer',
						!shouldShowCollapse && 'cursor-default'
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
							className={clsx(
								'i-ant-design-down-outlined w-3.5 h-3.5 flex-shrink-0 transition-transform text-gray-600 dark:text-gray-400',
								!isExpanded && 'transform rotate-180'
							)}
						/>
					)}
				</button>
				<IconButton
					icon="i-mdi-dots-vertical"
					size="sm"
					onClick={(e) => {
						e.stopPropagation();
						toggleMenu(e);
					}}
					aria-label={t`Section options`}
					className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
				/>
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
