import type { Data } from '@generated/data';
import { IconButton } from '@minimalstuff/ui';
import type { MouseEvent as ReactMouseEvent } from 'react';

import { cn } from '~/lib/cn';

type CollectionQuickActionsProps = {
	collection: Data.Collection;
	onCreateLink: (event: ReactMouseEvent<HTMLButtonElement>) => void;
	onOpenMenu: (event: ReactMouseEvent<HTMLButtonElement>) => void;
};

export function CollectionQuickActions({
	collection,
	onCreateLink,
	onOpenMenu,
}: Readonly<CollectionQuickActionsProps>) {
	const handleContainerClick = (event: ReactMouseEvent<HTMLDivElement>) =>
		event.stopPropagation();

	return (
		<div
			className={cn(
				'pointer-events-none absolute inset-y-0 right-0 flex items-center gap-0.5 py-1 pl-8 pr-2',
				'bg-gradient-to-l from-gray-50 via-gray-50/90 to-transparent dark:from-gray-900 dark:via-gray-900/90',
				'opacity-0 transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto'
			)}
			onClick={handleContainerClick}
		>
			<IconButton
				icon="i-ant-design-plus-outlined"
				size="sm"
				onClick={onCreateLink}
				aria-label={`Add link to ${collection.name}`}
			/>

			{/* The default (Inbox) collection can't be edited, renamed, or
			deleted, so it carries no kebab — the context menu still opens
			on right-click, offering only "Add link". */}
			{!collection.isDefault && (
				<IconButton
					icon="i-mdi-dots-vertical"
					size="sm"
					onClick={onOpenMenu}
					aria-label="Menu"
				/>
			)}
		</div>
	);
}
