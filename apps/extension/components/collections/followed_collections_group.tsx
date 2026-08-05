import clsx from 'clsx';
import { useState } from 'react';

import { FollowedCollectionSection } from './followed_collection_section';
import { useFollowedCollections } from '@/hooks/use_followed_collections';

/**
 * Collapsed by default — a follower opens the extension for their own
 * links far more often than someone else's, and a large followed collection
 * shouldn't push those below the fold on every open. Hidden entirely when
 * the user follows nothing, same as the other empty states in this tree.
 */
export function FollowedCollectionsGroup() {
	const [isExpanded, setIsExpanded] = useState(false);
	const { followedCollections } = useFollowedCollections();

	if (followedCollections.length === 0) {
		return null;
	}

	return (
		<div className="mb-2 border-b border-gray-200 pb-2 dark:border-gray-700">
			<button
				onClick={() => setIsExpanded((previous) => !previous)}
				aria-expanded={isExpanded}
				className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-white/50 dark:hover:bg-gray-800/50"
			>
				<div
					className={clsx(
						'i-ant-design-down-outlined h-3 w-3 flex-shrink-0 text-gray-500 transition-transform',
						!isExpanded && '-rotate-90'
					)}
				/>
				<div className="i-ant-design-team-outlined h-4 w-4 flex-shrink-0 text-gray-500" />
				<span className="flex-1 truncate text-sm font-medium text-gray-700 dark:text-gray-300">
					Followed
				</span>
				<span className="flex-shrink-0 text-xs text-gray-400">
					{followedCollections.length}
				</span>
			</button>
			{isExpanded && (
				<div className="ml-1 space-y-0.5">
					{followedCollections.map((collection) => (
						<FollowedCollectionSection
							key={collection.id}
							collection={collection}
						/>
					))}
				</div>
			)}
		</div>
	);
}
