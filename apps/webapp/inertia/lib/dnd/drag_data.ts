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

/**
 * Anything a dragged link can be filed into: a sidebar collection or the
 * pinned Inbox. Both carry the `collectionId` the drop resolves to.
 */
export function isLinkDropTargetData(
	data: unknown
): data is CollectionDragData | InboxDropData {
	return isCollectionDragData(data) || isInboxDropData(data);
}

export function isLinkDragData(data: unknown): data is LinkDragData {
	return (
		typeof data === 'object' &&
		data !== null &&
		'kind' in data &&
		data.kind === 'link'
	);
}
