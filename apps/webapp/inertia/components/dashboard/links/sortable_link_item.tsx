import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { LinkItem } from './link_item';
import { cn } from '~/lib/cn';
import type { DisplayLink } from '~/lib/link';
import {
	getLinkItemWrapperClassName,
	getLinkItemWrapperStyle,
} from '~/lib/link_layout';
import type { Layout } from '~/stores/layout_store';

type SortableLinkItemProps = {
	link: DisplayLink;
	collectionId: number;
	layout: Layout;
};

export function SortableLinkItem({
	link,
	collectionId,
	layout,
}: Readonly<SortableLinkItemProps>) {
	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: link.id,
		data: { kind: 'link', linkId: link.id, collectionId },
		attributes: { role: 'link' },
	});

	const style = {
		...getLinkItemWrapperStyle(layout),
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				getLinkItemWrapperClassName(layout),
				'cursor-grab active:cursor-grabbing'
			)}
		>
			<LinkItem
				link={link}
				layout={layout}
				dragAttributes={attributes}
				dragListeners={listeners}
				setActivatorNodeRef={setActivatorNodeRef}
			/>
		</div>
	);
}
