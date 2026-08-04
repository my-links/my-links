import { t } from '@lingui/core/macro';
import { CSS } from '@dnd-kit/utilities';
import type { Data } from '@generated/data';
import { useSortable } from '@dnd-kit/sortable';

import { CollectionItem } from './collection_item';
import { useIsMobile } from '~/hooks/use_is_mobile';
import type { CollectionSection } from '~/lib/dnd/dnd_types';
import { DragHandle } from '~/components/dashboard/dnd/drag_handle';

interface SortableCollectionItemProps {
	collection: Data.Collection;
	section: CollectionSection;
}

export function SortableCollectionItem({
	collection,
	section,
}: Readonly<SortableCollectionItemProps>) {
	const isMobile = useIsMobile();
	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: collection.id,
		data: { kind: 'collection', collectionId: collection.id, section },
		disabled: isMobile,
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
			className={isMobile ? undefined : 'cursor-grab active:cursor-grabbing'}
		>
			<CollectionItem
				collection={collection}
				dragListeners={isMobile ? undefined : listeners}
				dragHandle={
					isMobile ? null : (
						<DragHandle
							attributes={attributes}
							listeners={listeners}
							setActivatorNodeRef={setActivatorNodeRef}
							label={t`Reorder ${collection.name}`}
						/>
					)
				}
			/>
		</div>
	);
}
