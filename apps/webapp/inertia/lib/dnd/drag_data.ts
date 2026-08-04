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
