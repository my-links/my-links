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
};
