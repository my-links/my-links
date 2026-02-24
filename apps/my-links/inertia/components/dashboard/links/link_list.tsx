import { CollectionWithLinks, Link } from '#shared/types/dto';
import { PageProps } from '@adonisjs/inertia/types';
import { usePage } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import clsx from 'clsx';
import { useIsMobile } from '~/hooks/use_is_mobile';
import { useLayoutStore } from '~/stores/layout_store';
import { LinkItem } from './link_item';

interface PagePropsWithLinks extends PageProps {
	favoriteLinks: Link[];
	activeCollection?: CollectionWithLinks | null;
}

interface LinkListProps {
	links?: Link[];
}

export function LinkList({ links: linksProp }: LinkListProps = {}) {
	const { props } = usePage<PagePropsWithLinks>();
	const { layout } = useLayoutStore('dashboard');
	const isMobile = useIsMobile();
	const activeCollection = props.activeCollection;
	const favoriteLinks = props.favoriteLinks || [];

	const links = linksProp ?? activeCollection?.links ?? favoriteLinks;

	if (links.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<div className="i-ant-design-link-outlined w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
				<p className="text-gray-500 dark:text-gray-400 mb-2">
					<Trans>No links yet</Trans>
				</p>
				<p className="text-sm text-gray-400 dark:text-gray-500">
					<Trans>Create your first link to get started</Trans>
				</p>
			</div>
		);
	}

	const effectiveLayout = isMobile ? 'list' : layout;
	const isGrid = effectiveLayout === 'grid';
	const isList = effectiveLayout === 'list';
	const isCompact = effectiveLayout === 'compact';
	const isMasonry = effectiveLayout === 'masonry';

	return (
		<div
			className={clsx(
				'w-full',
				isGrid && 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
				isList && 'space-y-3',
				isCompact && 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3',
				isMasonry && 'columns-1 md:columns-2 lg:columns-3 gap-4'
			)}
		>
			{links.map((link) => (
				<div
					key={link.id}
					className={clsx(isMasonry && 'break-inside-avoid mb-4')}
				>
					<LinkItem link={link} layout={effectiveLayout} />
				</div>
			))}
		</div>
	);
}
