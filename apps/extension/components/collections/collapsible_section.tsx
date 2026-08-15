import clsx from 'clsx';
import type { ReactNode } from 'react';
import { ContextMenu, MenuItem } from '@minimalstuff/ui';

import { KebabMenu } from '@/components/common/kebab_menu';
import { KebabMenuItem } from '@/components/common/kebab_menu_item';

interface CollapsibleSectionProps {
	title: string;
	icon: string;
	count: number;
	isExpanded: boolean;
	onToggle: (isRecursive: boolean) => void;
	canMoveUp: boolean;
	canMoveDown: boolean;
	onMoveUp: () => void;
	onMoveDown: () => void;
	children: ReactNode;
}

/**
 * Shared chrome for the three top-level sidebar sections (Followed, Public,
 * Private): a collapse toggle plus a Move up/Move down action, backed by
 * `useSectionOrder`. Same dual kebab-menu/right-click-context-menu pattern as
 * `CollectionSection`/`LinkRow` — a hover-revealed kebab button and a
 * right-click both open the same set of actions. What renders inside is
 * entirely up to the caller — this component knows nothing about
 * collections. The bottom divider between sections is drawn by the parent
 * (`divide-y` in `collection_tree.tsx`) rather than here, so the last
 * rendered section never ends in a dangling border.
 */
export function CollapsibleSection({
	title,
	icon,
	count,
	isExpanded,
	onToggle,
	canMoveUp,
	canMoveDown,
	onMoveUp,
	onMoveDown,
	children,
}: Readonly<CollapsibleSectionProps>) {
	return (
		<div className="pb-2">
			<ContextMenu
				className="group flex items-center gap-1 rounded-md px-2 py-1.5 hover:bg-white/50 dark:hover:bg-gray-800/50"
				items={
					<>
						<MenuItem
							icon="i-ant-design-up-outlined"
							onClick={onMoveUp}
							disabled={!canMoveUp}
						>
							Move up
						</MenuItem>
						<MenuItem
							icon="i-ant-design-down-outlined"
							onClick={onMoveDown}
							disabled={!canMoveDown}
						>
							Move down
						</MenuItem>
					</>
				}
			>
				<button
					onClick={(event) => onToggle(event.shiftKey)}
					aria-expanded={isExpanded}
					className="flex min-w-0 flex-1 items-center gap-2 text-left"
				>
					<div
						className={clsx(
							'i-ant-design-caret-down-filled h-3 w-3 flex-shrink-0 opacity-25 text-gray-500 transition-transform',
							!isExpanded && '-rotate-90'
						)}
					/>
					<div className={clsx(icon, 'h-4 w-4 flex-shrink-0 text-gray-500')} />
					<span className="flex-1 truncate text-sm font-medium text-gray-700 dark:text-gray-300">
						{title}
					</span>
					<span className="flex-shrink-0 text-xs text-gray-400">{count}</span>
				</button>
				<div className="opacity-0 transition-opacity group-hover:opacity-100">
					<KebabMenu label={`${title} section options`}>
						<KebabMenuItem
							icon="i-ant-design-up-outlined"
							onClick={onMoveUp}
							disabled={!canMoveUp}
						>
							Move up
						</KebabMenuItem>
						<KebabMenuItem
							icon="i-ant-design-down-outlined"
							onClick={onMoveDown}
							disabled={!canMoveDown}
						>
							Move down
						</KebabMenuItem>
					</KebabMenu>
				</div>
			</ContextMenu>
			{isExpanded && <div className="ml-1 space-y-0.5">{children}</div>}
		</div>
	);
}
