import clsx from 'clsx';
import type { Data } from '@generated/data';
import { ReactNode, useState } from 'react';
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
}

export function CollapsibleSection({
	title,
	collections,
	section,
	canCollapse = true,
	alwaysShow = false,
}: Readonly<CollapsibleSectionProps>) {
	const [isExpanded, setIsExpanded] = useState(true);

	if (collections.length === 0 && !alwaysShow) {
		return null;
	}

	const shouldShowCollapse = canCollapse;
	return (
		<div className="mb-2">
			<button
				onClick={() => shouldShowCollapse && setIsExpanded(!isExpanded)}
				disabled={!shouldShowCollapse}
				className={clsx(
					'flex items-center justify-between w-full px-2 py-1.5 mb-1 rounded transition-colors',
					shouldShowCollapse &&
						'hover:bg-white/50 dark:hover:bg-gray-800/50 cursor-pointer',
					!shouldShowCollapse && 'cursor-default'
				)}
				aria-label={
					shouldShowCollapse ? (isExpanded ? 'Collapse' : 'Expand') : undefined
				}
			>
				<span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
					{title}
				</span>
				{shouldShowCollapse && (
					<div
						className={clsx(
							'i-ant-design-down-outlined w-3.5 h-3.5 transition-transform text-gray-600 dark:text-gray-400',
							!isExpanded && 'transform rotate-180'
						)}
					/>
				)}
			</button>
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
