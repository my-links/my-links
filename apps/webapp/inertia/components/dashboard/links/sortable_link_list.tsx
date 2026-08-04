import clsx from 'clsx';
import type { Data } from '@generated/data';
import {
	SortableContext,
	rectSortingStrategy,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import type { Layout } from '~/stores/layout_store';
import { SortableLinkItem } from './sortable_link_item';
import { getLinkContainerClassName } from '~/lib/link_layout';

interface SortableLinkListProps {
	links: Data.Link[];
	collectionId: number;
	layout: Layout;
}

export function SortableLinkList({
	links,
	collectionId,
	layout,
}: Readonly<SortableLinkListProps>) {
	const strategy =
		layout === 'list' ? verticalListSortingStrategy : rectSortingStrategy;

	return (
		<SortableContext items={links.map((link) => link.id)} strategy={strategy}>
			<div className={clsx('w-full', getLinkContainerClassName(layout))}>
				{links.map((link) => (
					<SortableLinkItem
						key={link.id}
						link={link}
						collectionId={collectionId}
						layout={layout}
					/>
				))}
			</div>
		</SortableContext>
	);
}
