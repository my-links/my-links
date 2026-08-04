import clsx from 'clsx';
import { CSS } from '@dnd-kit/utilities';
import type { Data } from '@generated/data';
import { useSortable } from '@dnd-kit/sortable';

import { LinkItem } from './link_item';
import type { Layout } from '~/stores/layout_store';
import { getLinkItemWrapperClassName } from '~/lib/link_layout';

interface SortableLinkItemProps {
	link: Data.Link;
	collectionId: number;
	layout: Layout;
}

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
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={clsx(
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
