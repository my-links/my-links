import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import clsx from 'clsx';
import { useIsMobile } from '~/hooks/use_is_mobile';
import { useLayoutStore } from '~/stores/layout_store';
import { LinkItem } from '../dashboard/links/link_item';

interface SharedLinkListProps {
	links: Data.Link[];
}

export function SharedLinkList({ links }: Readonly<SharedLinkListProps>) {
	const { layout } = useLayoutStore('shared');
	const isMobile = useIsMobile();

	if (links.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<div className="i-ant-design-link-outlined w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
				<p className="text-gray-500 dark:text-gray-400 mb-2">
					<Trans>No links yet</Trans>
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
