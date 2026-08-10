import { useDroppable } from '@dnd-kit/core';

import type { CollectionWithLinks } from '@/lib/api/types';
import { collectionSortableId } from '@/lib/dnd/dnd_types';
import { CollectionSectionBody } from './collection_section_body';

interface PinnedInboxSectionProps {
	collection: CollectionWithLinks;
	isExpanded: boolean;
	onToggle: () => void;
}

/**
 * The Inbox, pinned above the sortable sections rather than sitting inside
 * "Private" — same row as `CollectionSection`, but a plain drop target
 * instead of a sortable one: it never reorders relative to other collections.
 */
export function PinnedInboxSection({
	collection,
	isExpanded,
	onToggle,
}: Readonly<PinnedInboxSectionProps>) {
	const { setNodeRef } = useDroppable({
		id: collectionSortableId(collection.id),
		data: { kind: 'inbox', collectionId: collection.id },
	});

	return (
		<div ref={setNodeRef} className="group mb-1">
			<CollectionSectionBody
				collection={collection}
				isExpanded={isExpanded}
				onToggle={onToggle}
			/>
		</div>
	);
}
