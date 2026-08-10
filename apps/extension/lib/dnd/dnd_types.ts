import type { CollectionVisibility } from '@/lib/api/types';

export const COLLECTION_SECTION = {
	FOLLOWED: 'followed',
	PUBLIC: 'public',
	PRIVATE: 'private',
} as const;

export type CollectionSection =
	(typeof COLLECTION_SECTION)[keyof typeof COLLECTION_SECTION];

/**
 * Followed collections have no `CollectionVisibility` of their own (they
 * belong to whoever authored them) — only the two owned sections map to one,
 * so `visibilityForSection`/`sectionForVisibility` are typed over this
 * narrower union rather than the full `CollectionSection`.
 */
type OwnedCollectionSection = Exclude<
	CollectionSection,
	typeof COLLECTION_SECTION.FOLLOWED
>;

const VISIBILITY_BY_SECTION: Record<
	OwnedCollectionSection,
	CollectionVisibility
> = {
	[COLLECTION_SECTION.PUBLIC]: 'PUBLIC',
	[COLLECTION_SECTION.PRIVATE]: 'PRIVATE',
};

const SECTION_BY_VISIBILITY: Record<
	CollectionVisibility,
	OwnedCollectionSection
> = {
	PUBLIC: COLLECTION_SECTION.PUBLIC,
	PRIVATE: COLLECTION_SECTION.PRIVATE,
};

export function visibilityForSection(
	section: OwnedCollectionSection
): CollectionVisibility {
	return VISIBILITY_BY_SECTION[section];
}

export function sectionForVisibility(
	visibility: CollectionVisibility
): OwnedCollectionSection {
	return SECTION_BY_VISIBILITY[visibility];
}

/**
 * `isOwner` gates link drops (see collision_detection.ts): only an owned
 * collection may receive a link dropped onto it, a followed collection isn't
 * a legal target since the follower doesn't manage its contents. Collection
 * ordering itself doesn't need the flag — a collection can only ever collide
 * with containers sharing its own `section`, and `followed` is disjoint from
 * `public`/`private`, so followed collections only ever reorder among
 * themselves regardless of `isOwner`.
 */
export type CollectionDragData = {
	kind: 'collection';
	collectionId: number;
	section: CollectionSection;
	isOwner: boolean;
};

/**
 * The pinned Inbox drop zone. It carries no `section` because it belongs to
 * none: a dragged collection may only land among its own section's rows, and
 * the Inbox sits outside all of them. Links still drop onto it.
 */
export type InboxDropData = {
	kind: 'inbox';
	collectionId: number;
};

export type LinkDragData = {
	kind: 'link';
	linkId: number;
	collectionId: number;
};

export type DragData = CollectionDragData | InboxDropData | LinkDragData;

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
