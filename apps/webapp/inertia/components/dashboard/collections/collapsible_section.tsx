import type { Data } from '@generated/data';
import type { ReactNode } from 'react';

import { CollapsibleSectionHeader } from './collapsible_section_header';
import { SortableCollectionGroup } from './sortable_collection_group';
import { useSectionMoveDropZone } from '~/hooks/use_section_move_drop_zone';
import { useSidebarMode } from '~/hooks/use_sidebar_mode';
import { cn } from '~/lib/cn';
import type { CollectionSection } from '~/lib/dnd/dnd_types';
import { useSectionCollapseStore } from '~/stores/section_collapse_store';

type CollectionWithLinks = Data.Collection.Variants['withLinks'];

const HOVERED_MOVE_CLASSES =
	'rounded-lg bg-blue-50 ring-1 ring-blue-300 opacity-100 dark:bg-blue-900/20 dark:ring-blue-400/40';

type CollapsibleSectionProps = {
	title: ReactNode;
	collections: CollectionWithLinks[];
	section: CollectionSection;
	canCollapse?: boolean;
	alwaysShow?: boolean;
	canMoveUp: boolean;
	canMoveDown: boolean;
	onMoveUp: () => void;
	onMoveDown: () => void;
};

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
	const isRail = useSidebarMode() === 'rail';
	const { setNodeRef, isHoveredByMove } = useSectionMoveDropZone(section);

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
			<div
				ref={setNodeRef}
				className={cn(
					'mb-2 space-y-1',
					isHoveredByMove && HOVERED_MOVE_CLASSES
				)}
			>
				<hr className="mx-3 my-2 border-gray-200/50 dark:border-gray-700/50" />
				<SortableCollectionGroup collections={collections} section={section} />
			</div>
		);
	}

	return (
		<div
			ref={setNodeRef}
			className={cn(
				'mb-2',
				isEmpty && 'opacity-40',
				isHoveredByMove && HOVERED_MOVE_CLASSES
			)}
		>
			<CollapsibleSectionHeader
				title={title}
				section={section}
				shouldShowCollapse={shouldShowCollapse}
				canMoveUp={canMoveUp}
				canMoveDown={canMoveDown}
				onMoveUp={onMoveUp}
				onMoveDown={onMoveDown}
			/>
			{isExpanded && (
				<div className="space-y-1">
					<SortableCollectionGroup
						collections={collections}
						section={section}
					/>
				</div>
			)}
		</div>
	);
}
