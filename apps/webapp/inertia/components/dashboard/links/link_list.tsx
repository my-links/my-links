import { usePage } from '@inertiajs/react';
import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import { PageProps } from '@adonisjs/inertia/types';

import { cn } from '~/lib/cn';
import { LinkItem } from './link_item';
import { useIsMobile } from '~/hooks/use_is_mobile';
import { useLayoutStore } from '~/stores/layout_store';
import {
	getLinkContainerClassName,
	getLinkContainerStyle,
	getLinkItemWrapperClassName,
	getLinkItemWrapperStyle,
} from '~/lib/link_layout';

interface PagePropsWithLinks extends PageProps {
	favoriteLinks: Data.Link[];
	activeCollection?: Data.Collection.Variants['withLinks'] | null;
}

interface LinkListProps {
	links?: Data.Link[];
}

export function LinkList({ links: linksProp }: Readonly<LinkListProps> = {}) {
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

	return (
		<div
			className={cn('w-full', getLinkContainerClassName(effectiveLayout))}
			style={getLinkContainerStyle(effectiveLayout)}
		>
			{links.map((link) => (
				<div
					key={link.id}
					className={getLinkItemWrapperClassName(effectiveLayout)}
					style={getLinkItemWrapperStyle(effectiveLayout)}
				>
					<LinkItem link={link} layout={effectiveLayout} />
				</div>
			))}
		</div>
	);
}
