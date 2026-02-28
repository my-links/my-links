import { Link } from '@adonisjs/inertia/react';
import { PageProps } from '@adonisjs/inertia/types';
import type { Data } from '@generated/data';
import { usePage } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import clsx from 'clsx';

interface PagePropsWithActiveCollection extends PageProps {
	activeCollection?: Data.Collection.Variants['withLinks'] | null;
}

export function CollectionFavoriteItem() {
	const { props } = usePage<PagePropsWithActiveCollection>();
	const activeCollection = props.activeCollection;
	const isActive = !activeCollection?.id;

	return (
		<Link
			route="collection.favorites"
			className={clsx(
				'flex items-center gap-3 px-4 py-2 rounded-md transition-colors',
				'hover:bg-white/50 dark:hover:bg-gray-800/50',
				'text-gray-700 dark:text-gray-300',
				isActive &&
					'bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
			)}
			title="Favorite"
		>
			<div
				className={clsx(
					'w-5 h-5 flex-shrink-0',
					isActive ? 'i-tabler-star-filled' : 'i-tabler-star'
				)}
			/>
			<span className="truncate flex-1">
				<Trans>Favorite</Trans>
			</span>
		</Link>
	);
}
