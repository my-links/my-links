import {
	SortableContext,
	rectSortingStrategy,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { SortableLinkItem } from './sortable_link_item';
import { cn } from '~/lib/cn';
import type { DisplayLink } from '~/lib/link';
import {
	getLinkContainerClassName,
	getLinkContainerStyle,
} from '~/lib/link_layout';
import type { Layout } from '~/stores/layout_store';

type SortableLinkListProps = {
	links: DisplayLink[];
	collectionId: number;
	layout: Layout;
};

export function SortableLinkList({
	links,
	collectionId,
	layout,
}: Readonly<SortableLinkListProps>) {
	const strategy =
		layout === 'list' ? verticalListSortingStrategy : rectSortingStrategy;

	return (
		<SortableContext items={links.map((link) => link.id)} strategy={strategy}>
			<div
				className={cn('w-full', getLinkContainerClassName(layout))}
				style={getLinkContainerStyle(layout)}
			>
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
