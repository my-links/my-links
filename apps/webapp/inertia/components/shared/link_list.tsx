import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';

import { cn } from '~/lib/cn';
import { useIsMobile } from '~/hooks/use_is_mobile';
import { useLayoutStore } from '~/stores/layout_store';
import { LinkItem } from '../dashboard/links/link_item';
import {
	getLinkContainerClassName,
	getLinkContainerStyle,
	getLinkItemWrapperClassName,
	getLinkItemWrapperStyle,
} from '~/lib/link_layout';

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
