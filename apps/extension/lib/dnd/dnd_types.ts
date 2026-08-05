export const COLLECTION_SECTION = {
	PUBLIC: 'public',
	PRIVATE: 'private',
} as const;

export type CollectionSection =
	(typeof COLLECTION_SECTION)[keyof typeof COLLECTION_SECTION];

/**
 * No `isOwner` field, unlike the webapp source this was ported from —
 * followed collections never register as draggable/droppable in the
 * extension panel (they render outside the DndContext entirely), so every
 * `CollectionDragData` instance is owned by construction.
 */
export type CollectionDragData = {
	kind: 'collection';
	collectionId: number;
	section: CollectionSection;
};

export type LinkDragData = {
	kind: 'link';
	linkId: number;
	collectionId: number;
};

export type DragData = CollectionDragData | LinkDragData;
