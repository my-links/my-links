import clsx from 'clsx';
import { useRef } from 'react';
import { t } from '@lingui/core/macro';
import type { Data } from '@generated/data';

import { LinkFavicon } from './link_favicon';
import { hasCollectionIds } from '~/lib/link';
import { LinkControls, LinkControlsRef } from './link_controls';

interface LinkItemProps {
	link: Data.Link;
	hideMenu?: boolean;
	layout?: 'grid' | 'list' | 'compact' | 'masonry';
}

export function LinkItem({
	link,
	hideMenu = false,
	layout = 'grid',
}: Readonly<LinkItemProps>) {
	const { name, url, description } = link;
	const showFavoriteIcon = !hideMenu && 'favorite' in link && link.favorite;
	const collectionCount = hasCollectionIds(link)
		? link.collectionIds.length
		: 0;
	const linkControlsRef = useRef<LinkControlsRef>(null);

	const handleClick = (e: React.MouseEvent) => {
		if (
			!hideMenu &&
			(e.target as HTMLElement).closest('[data-link-controls]')
		) {
			e.preventDefault();
			e.stopPropagation();
		}
	};

	const handleContextMenu = (e: React.MouseEvent) => {
		if (!hideMenu) {
			e.preventDefault();
			linkControlsRef.current?.openContextMenu(e.clientX, e.clientY);
		}
	};

	const isCompact = layout === 'compact';
	const isList = layout === 'list';

	return (
		<a
			href={url}
			target="_blank"
			rel="noreferrer"
			onClick={handleClick}
			onContextMenu={handleContextMenu}
			className={clsx(
				'block rounded-lg border',
				'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm',
				'border-gray-200/50 dark:border-gray-700/50',
				'hover:border-blue-300 dark:hover:border-blue-500',
				'hover:shadow-md',
				isList ? 'p-4' : 'p-4',
				isCompact && 'p-3'
			)}
			title={url}
		>
			<div className="flex items-start gap-3 flex-row">
				<div className="flex items-start gap-3 flex-1 min-w-0">
					<LinkFavicon url={url} size={isCompact ? 24 : 32} />
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-1">
							<h3
								className={clsx(
									'font-medium text-blue-600 dark:text-blue-400 truncate',
									isCompact ? 'text-sm' : 'text-base'
								)}
							>
								{name}
							</h3>
							{collectionCount > 1 && (
								<span
									title={t`In ${collectionCount} collections`}
									className="flex-shrink-0 rounded bg-gray-100 dark:bg-gray-700 px-1.5 text-xs text-gray-500 dark:text-gray-400"
								>
									{collectionCount}
								</span>
							)}
							{showFavoriteIcon && (
								<div className="i-ant-design-star-filled w-4 h-4 text-yellow-500 flex-shrink-0" />
							)}
						</div>
						<p
							className={clsx(
								'text-gray-500 dark:text-gray-400 truncate',
								isCompact ? 'text-xs' : 'text-sm'
							)}
						>
							{url}
						</p>
					</div>
				</div>
				{!hideMenu && (
					<div data-link-controls className="self-start">
						<LinkControls ref={linkControlsRef} link={link} />
					</div>
				)}
			</div>
			{description && !isCompact && (
				<p
					className={clsx(
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
