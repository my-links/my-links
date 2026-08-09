export const COLLECTION_SECTION = {
	FOLLOWED: 'followed',
	PUBLIC: 'public',
	PRIVATE: 'private',
} as const;

export type CollectionSection =
	(typeof COLLECTION_SECTION)[keyof typeof COLLECTION_SECTION];

export type CollectionDragData = {
	kind: 'collection';
	collectionId: number;
	section: CollectionSection;
	isOwner: boolean;
};

/**
 * The pinned Inbox drop zone. It carries no `section` because it belongs to
 * none: a dragged collection may only land among its own section's items, and
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
