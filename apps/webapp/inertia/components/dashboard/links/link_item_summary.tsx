import { t } from '@lingui/core/macro';
import type { Data } from '@generated/data';

import { cn } from '~/lib/cn';
import { LinkFavicon } from './link_favicon';
import { hasCollectionIds } from '~/lib/link';

type LinkItemSummaryProps = {
	link: Data.Link;
	isCompact: boolean;
	showFavoriteIcon: boolean;
	faviconCacheBust: number;
};

export function LinkItemSummary({
	link,
	isCompact,
	showFavoriteIcon,
	faviconCacheBust,
}: Readonly<LinkItemSummaryProps>) {
	const { name, url } = link;
	const collectionCount = hasCollectionIds(link)
		? link.collectionIds.length
		: 0;

	return (
		<div className="flex items-start gap-3 flex-1 min-w-0">
			<LinkFavicon
				url={url}
				size={isCompact ? 24 : 32}
				cacheBust={faviconCacheBust}
			/>
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 mb-1">
					<h3
						className={cn(
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
					className={cn(
						'text-gray-500 dark:text-gray-400 truncate',
						isCompact ? 'text-xs' : 'text-sm'
					)}
				>
					{url}
				</p>
			</div>
		</div>
	);
}
