import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

import type { CollectionWithLinks } from '@/lib/api/types';
import { CollectionSectionBody } from './collection_section_body';
import {
	collectionSortableId,
	type CollectionSection as CollectionDndSection,
} from '@/lib/dnd/dnd_types';

interface CollectionSectionProps {
	collection: CollectionWithLinks;
	section: CollectionDndSection;
	isExpanded: boolean;
	onToggle: () => void;
}

export function CollectionSection({
	collection,
	section,
	isExpanded,
	onToggle,
}: Readonly<CollectionSectionProps>) {
	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: collectionSortableId(collection.id),
		data: {
			kind: 'collection',
			collectionId: collection.id,
			section,
			isOwner: true,
		},
		// Default layout-change animation scales rows to old/new height on reorder — wrong for wildly variable collapsed/expanded heights.
		animateLayoutChanges: () => false,
	});

	return (
		<div
			ref={setNodeRef}
			style={{
				transform: CSS.Transform.toString(transform),
				transition,
				opacity: isDragging ? 0.5 : undefined,
			}}
			className="group mb-1"
		>
			<CollectionSectionBody
				collection={collection}
				isExpanded={isExpanded}
				onToggle={onToggle}
				dragAttributes={attributes}
				dragListeners={listeners}
				setActivatorNodeRef={setActivatorNodeRef}
			/>
		</div>
	);
}
