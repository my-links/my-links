import { useRef, useState } from 'react';
import type { Data } from '@generated/data';
import type {
	DraggableAttributes,
	DraggableSyntheticListeners,
} from '@dnd-kit/core';

import { cn } from '~/lib/cn';
import { urlFor } from '~/lib/tuyau';
import { LinkItemSummary } from './link_item_summary';
import { LinkControls, LinkControlsRef } from './link_controls';
import { shouldSuppressClick } from '~/lib/dnd/drag_click_guard';

type LinkItemProps = {
	link: Data.Link;
	hideMenu?: boolean;
	layout?: 'grid' | 'list' | 'compact' | 'masonry';
	dragAttributes?: DraggableAttributes;
	dragListeners?: DraggableSyntheticListeners;
	setActivatorNodeRef?: (element: HTMLElement | null) => void;
};

export function LinkItem({
	link,
	hideMenu = false,
	layout = 'grid',
	dragAttributes,
	dragListeners,
	setActivatorNodeRef,
}: Readonly<LinkItemProps>) {
	const { url, description } = link;
	const showFavoriteIcon = !hideMenu && 'favorite' in link && link.favorite;
	const linkControlsRef = useRef<LinkControlsRef>(null);
	const [faviconCacheBust, setFaviconCacheBust] = useState(0);

	const handleFaviconRefreshed = () => {
		setFaviconCacheBust((version) => version + 1);
	};

	const handleClick = (e: React.MouseEvent) => {
		if (shouldSuppressClick()) {
			e.preventDefault();
			return;
		}
		if (
			!hideMenu &&
			(e.target as HTMLElement).closest('[data-link-controls]')
		) {
			e.preventDefault();
			e.stopPropagation();
		}
	};

	const handleContextMenu = (e: React.MouseEvent) => {
		// openContextMenu redispatches a synthetic contextmenu event on a node
		// inside this same link, which bubbles back here; ignoring untrusted
		// events breaks that infinite loop instead of recursing forever.
		if (!hideMenu && e.nativeEvent.isTrusted) {
			e.preventDefault();
			linkControlsRef.current?.openContextMenu(e.clientX, e.clientY);
		}
	};

	const isCompact = layout === 'compact';
	const isList = layout === 'list';

	// Opened through the server redirect rather than straight to `url`, so a
	// click counts the same here as it does from the browser extension.
	const visitUrl = urlFor('link.visit', { id: link.id });

	return (
		<a
			ref={setActivatorNodeRef}
			href={visitUrl}
			target="_blank"
			rel="noreferrer"
			onClick={handleClick}
			onContextMenu={handleContextMenu}
			className={cn(
				'block rounded-lg border',
				'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm',
				'border-gray-200/50 dark:border-gray-700/50',
				'hover:border-blue-300 dark:hover:border-blue-500',
				'hover:shadow-md',
				isList ? 'p-4' : 'p-4',
				isCompact && 'p-3'
			)}
			title={url}
			{...dragAttributes}
			{...dragListeners}
		>
			<div className="flex items-start gap-3 flex-row">
				<LinkItemSummary
					link={link}
					isCompact={isCompact}
					showFavoriteIcon={showFavoriteIcon}
					faviconCacheBust={faviconCacheBust}
				/>
				{!hideMenu && (
					<div data-link-controls className="self-start">
						<LinkControls
							ref={linkControlsRef}
							link={link}
							onFaviconRefreshed={handleFaviconRefreshed}
						/>
					</div>
				)}
			</div>
			{description && !isCompact && (
				<p
					className={cn(
						'mt-3 text-sm text-gray-600 dark:text-gray-400',
						'line-clamp-3 break-words whitespace-pre-line'
					)}
				>
					{description}
				</p>
			)}
		</a>
	);
}
