import { t } from '@lingui/core/macro';
import { usePage } from '@inertiajs/react';
import { Tooltip } from '@minimalstuff/ui';
import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import { Link } from '@adonisjs/inertia/react';
import { PageProps } from '@adonisjs/inertia/types';

import { cn } from '~/lib/cn';
import { RAIL_ITEM_CLASS } from '~/consts/sidebar';
import { useIsMobile } from '~/hooks/use_is_mobile';
import { useSidebarMode } from '~/hooks/use_sidebar_mode';
import { useDashboardLayoutStore } from '~/stores/dashboard_layout_store';

interface PagePropsWithActiveCollection extends PageProps {
	activeCollection?: Data.Collection.Variants['withLinks'] | null;
}

export function CollectionFavoriteItem() {
	const { props } = usePage<PagePropsWithActiveCollection>();
	const activeCollection = props.activeCollection;
	const isActive = !activeCollection?.id;
	const isMobile = useIsMobile();
	const isRail = useSidebarMode() === 'rail';
	const setSidebarOpen = useDashboardLayoutStore(
		(state) => state.setSidebarOpen
	);

	const handleClick = () => {
		if (isMobile) {
			setSidebarOpen(false);
		}
	};

	const favoriteLink = (
		<Link
			route="collection.favorites"
			preserveScroll
			data-tour="favorites"
			className={cn(
				'flex items-center gap-3 py-2 rounded-md transition-colors',
				isRail ? RAIL_ITEM_CLASS : 'px-4',
				'hover:bg-white/50 dark:hover:bg-gray-800/50',
				'text-gray-700 dark:text-gray-300',
				isActive &&
					'bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
			)}
			title={isRail ? undefined : t`Favorite`}
			onClick={handleClick}
		>
			<div
				className={cn(
					'w-5 h-5 flex-shrink-0',
					isActive ? 'i-tabler-star-filled' : 'i-tabler-star'
				)}
			/>
			{!isRail && (
				<span className="truncate flex-1">
					<Trans>Favorite</Trans>
				</span>
			)}
		</Link>
	);

	return isRail ? (
		<Tooltip
			content={t`Favorite`}
			position="right"
			className="!flex !justify-center"
		>
			{favoriteLink}
		</Tooltip>
	) : (
		favoriteLink
	);
}
