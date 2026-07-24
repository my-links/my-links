import clsx from 'clsx';
import { useState } from 'react';

import { LinkRow } from './link_row';
import type { CollectionWithLinks } from '@/lib/api/types';

interface CollectionSectionProps {
	collection: CollectionWithLinks;
}

export function CollectionSection({
	collection,
}: Readonly<CollectionSectionProps>) {
	const [isExpanded, setIsExpanded] = useState(true);
	const links = collection.links ?? [];

	const handleToggle = () => setIsExpanded((previous) => !previous);

	return (
		<div className="mb-1">
			<button
				onClick={handleToggle}
				className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-white/50 dark:hover:bg-gray-800/50"
				aria-expanded={isExpanded}
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
						links.map((link) => <LinkRow key={link.id} link={link} />)
					)}
				</div>
			)}
		</div>
	);
}
