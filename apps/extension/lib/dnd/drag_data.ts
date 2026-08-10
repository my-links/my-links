import type {
	CollectionDragData,
	InboxDropData,
	LinkDragData,
} from './dnd_types';

export function isCollectionDragData(
	data: unknown
): data is CollectionDragData {
	return (
		typeof data === 'object' &&
		data !== null &&
		'kind' in data &&
		data.kind === 'collection'
	);
}

export function isInboxDropData(data: unknown): data is InboxDropData {
	return (
		typeof data === 'object' &&
		data !== null &&
		'kind' in data &&
		data.kind === 'inbox'
	);
}

export function isLinkDragData(data: unknown): data is LinkDragData {
	return (
		typeof data === 'object' &&
		data !== null &&
		'kind' in data &&
		data.kind === 'link'
	);
}

/**
 * Every drop target kind designates a collection: a collection row and the
 * pinned Inbox are their own target, a link row stands for the collection
 * holding it. Dropping a link on any of them is what decides between an
 * in-collection reorder and a move.
 */
export function collectionIdForDropTarget(data: unknown): number | undefined {
	if (isCollectionDragData(data) || isInboxDropData(data)) {
		return data.collectionId;
	}
	if (isLinkDragData(data)) {
		return data.collectionId;
	}
	return undefined;
}
