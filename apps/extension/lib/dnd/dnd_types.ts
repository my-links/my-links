import type { CollectionVisibility } from '@/lib/api/types';

export const COLLECTION_SECTION = {
	PUBLIC: 'public',
	PRIVATE: 'private',
} as const;

export type CollectionSection =
	(typeof COLLECTION_SECTION)[keyof typeof COLLECTION_SECTION];

const VISIBILITY_BY_SECTION: Record<CollectionSection, CollectionVisibility> = {
	[COLLECTION_SECTION.PUBLIC]: 'PUBLIC',
	[COLLECTION_SECTION.PRIVATE]: 'PRIVATE',
};

const SECTION_BY_VISIBILITY: Record<CollectionVisibility, CollectionSection> = {
	PUBLIC: COLLECTION_SECTION.PUBLIC,
	PRIVATE: COLLECTION_SECTION.PRIVATE,
};

export function visibilityForSection(
	section: CollectionSection
): CollectionVisibility {
	return VISIBILITY_BY_SECTION[section];
}

export function sectionForVisibility(
	visibility: CollectionVisibility
): CollectionSection {
	return SECTION_BY_VISIBILITY[visibility];
}

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

/**
 * Collections and links are separate tables with their own auto-increment
 * ids, so raw ids collide inside the single `<DndContext>` that holds both.
 * dnd-kit keys its draggable and droppable registries by id, meaning the
 * last-mounted of a colliding pair silently evicts the other. Namespacing
 * keeps both registrable; handlers read `active.data`/`over.data` rather
 * than parsing these back.
 */
export function collectionSortableId(collectionId: number): string {
	return `collection-${collectionId}`;
}

export function linkSortableId(linkId: number): string {
	return `link-${linkId}`;
}
