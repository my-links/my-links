import clsx from 'clsx';
import { t } from '@lingui/core/macro';
import type { Data } from '@generated/data';
import { ReactNode, useState } from 'react';
import { IconButton } from '@minimalstuff/ui';
import {
	SortableContext,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import type { CollectionSection } from '~/lib/dnd/dnd_types';
import { CollectionFavoriteItem } from './collection_favorite_item';
import { SortableCollectionItem } from './sortable_collection_item';

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
	const [isExpanded, setIsExpanded] = useState(true);

	if (collections.length === 0 && !alwaysShow) {
		return null;
	}

	const shouldShowCollapse = canCollapse;
	return (
		<div className="mb-2">
			<div className="flex items-center justify-between w-full px-2 py-1.5 mb-1 rounded transition-colors gap-1">
				<button
					onClick={() => shouldShowCollapse && setIsExpanded(!isExpanded)}
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
				<div className="flex items-center gap-0.5 flex-shrink-0">
					<IconButton
						icon="i-ant-design-up-outlined"
						size="sm"
						variant="ghost"
						disabled={!canMoveUp}
						onClick={onMoveUp}
						aria-label={t`Move section up`}
					/>
					<IconButton
						icon="i-ant-design-down-outlined"
						size="sm"
						variant="ghost"
						disabled={!canMoveDown}
						onClick={onMoveDown}
						aria-label={t`Move section down`}
					/>
				</div>
			</div>
			{isExpanded && (
				<div className="space-y-1">
					{alwaysShow && <CollectionFavoriteItem />}
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
