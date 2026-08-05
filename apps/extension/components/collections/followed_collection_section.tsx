import clsx from 'clsx';
import { useState } from 'react';

import { FollowedLinkRow } from './followed_link_row';
import type { FollowedCollectionWithLinks } from '@/lib/api/types';

interface FollowedCollectionSectionProps {
	collection: FollowedCollectionWithLinks;
}

/**
 * Read-only counterpart to `CollectionSection` — no add-link button, no
 * kebab menu (rename/delete belong to the author, not a follower).
 */
export function FollowedCollectionSection({
	collection,
}: Readonly<FollowedCollectionSectionProps>) {
	const [isExpanded, setIsExpanded] = useState(true);
	const links = collection.links ?? [];

	return (
		<div className="mb-1">
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
				{collection.icon ? (
					<span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-base">
						{collection.icon}
					</span>
				) : (
					<div className="i-ant-design-folder-outlined h-5 w-5 flex-shrink-0 text-gray-500" />
				)}
				<span className="flex-1 truncate text-sm font-medium text-gray-700 dark:text-gray-300">
					{collection.name}
				</span>
				<span className="flex-shrink-0 text-xs text-gray-400">
					{links.length}
				</span>
			</button>
			{isExpanded && (
				<div className="ml-1 space-y-0.5 border-l border-gray-200 pl-2 dark:border-gray-700">
					{links.length === 0 ? (
						<p className="px-2 py-1 text-xs text-gray-400">No links yet.</p>
					) : (
						links.map((link) => <FollowedLinkRow key={link.id} link={link} />)
					)}
				</div>
			)}
		</div>
	);
}
