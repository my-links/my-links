import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { ContextMenu, IconButton, MenuItem } from '@minimalstuff/ui';
import { ReactNode, useRef, type MouseEvent as ReactMouseEvent } from 'react';

import { cn } from '~/lib/cn';
import type { CollectionSection } from '~/lib/dnd/dnd_types';
import { dispatchContextMenuAt } from '~/lib/dispatch_context_menu';
import { useSectionCollapseStore } from '~/stores/section_collapse_store';

type CollapsibleSectionHeaderProps = {
	title: ReactNode;
	section: CollectionSection;
	shouldShowCollapse: boolean;
	canMoveUp: boolean;
	canMoveDown: boolean;
	onMoveUp: () => void;
	onMoveDown: () => void;
};

export function CollapsibleSectionHeader({
	title,
	section,
	shouldShowCollapse,
	canMoveUp,
	canMoveDown,
	onMoveUp,
	onMoveDown,
}: Readonly<CollapsibleSectionHeaderProps>) {
	const isExpanded = useSectionCollapseStore(
		(state) => state.expanded[section]
	);
	const toggleSection = useSectionCollapseStore((state) => state.toggleSection);
	const menuRef = useRef<HTMLDivElement>(null);

	const handleToggle = () => {
		if (shouldShowCollapse) toggleSection(section);
	};

	const handleMoveUp = (event: ReactMouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		onMoveUp();
	};

	const handleMoveDown = (event: ReactMouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		onMoveDown();
	};

	const handleOpenMenu = (event: ReactMouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		dispatchContextMenuAt(menuRef.current, event.clientX, event.clientY);
	};

	return (
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
				onClick={handleToggle}
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
					onClick={handleOpenMenu}
					aria-label={t`Section options`}
				/>
			</div>
		</ContextMenu>
	);
}
