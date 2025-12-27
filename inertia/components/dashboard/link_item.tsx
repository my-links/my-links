import { Link } from '#shared/types/dto';
import clsx from 'clsx';
import { useRef } from 'react';
import { LinkControls, LinkControlsRef } from './link_controls';
import { LinkFavicon } from './link_favicon';

interface LinkItemProps {
	link: Link;
	hideMenu?: boolean;
	layout?: 'grid' | 'list' | 'compact' | 'masonry';
}

export function LinkItem({
	link,
	hideMenu = false,
	layout = 'grid',
}: LinkItemProps) {
	const { name, url, description } = link;
	const showFavoriteIcon = !hideMenu && 'favorite' in link && link.favorite;
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
							{showFavoriteIcon && (
								<div className="i-ant-design-star-filled w-4 h-4 text-yellow-500 flex-shrink-0" />
							)}
						</div>
						<LinkItemURL url={url} compact={isCompact} />
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

function LinkItemURL({
	url,
	compact,
}: {
	url: Link['url'];
	compact?: boolean;
}) {
	try {
		const { origin, pathname } = new URL(url);
		return (
			<p
				className={clsx(
					'text-gray-500 dark:text-gray-400 truncate',
					compact ? 'text-xs' : 'text-sm'
				)}
			>
				{origin}
				{pathname !== '/' && pathname}
			</p>
		);
	} catch {
		return (
			<p
				className={clsx(
					'text-gray-500 dark:text-gray-400 truncate',
					compact ? 'text-xs' : 'text-sm'
				)}
			>
				{url}
			</p>
		);
	}
}
