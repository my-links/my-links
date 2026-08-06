import type { CollectionDragData, LinkDragData } from './dnd_types';

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

export function isLinkDragData(data: unknown): data is LinkDragData {
	return (
		typeof data === 'object' &&
		data !== null &&
		'kind' in data &&
		data.kind === 'link'
	);
}

/**
 * Both drop target kinds designate a collection: a collection row is its own
 * target, a link row stands for the collection holding it. Dropping a link on
 * either is what decides between an in-collection reorder and a move.
 */
export function collectionIdForDropTarget(data: unknown): number | undefined {
	if (isCollectionDragData(data)) {
		return data.collectionId;
	}
	if (isLinkDragData(data)) {
		return data.collectionId;
	}
	return undefined;
}
