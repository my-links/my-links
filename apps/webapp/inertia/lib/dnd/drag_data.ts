import type { CollectionDragData } from './dnd_types';

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
