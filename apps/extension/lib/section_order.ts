import {
	COLLECTION_SECTION,
	type CollectionSection,
} from '@/lib/dnd/dnd_types';

export const DEFAULT_SECTION_ORDER: CollectionSection[] = [
	COLLECTION_SECTION.FOLLOWED,
	COLLECTION_SECTION.PUBLIC,
	COLLECTION_SECTION.PRIVATE,
];

function swapAt<TItem>(
	items: TItem[],
	indexA: number,
	indexB: number
): TItem[] {
	const itemA = items[indexA];
	const itemB = items[indexB];
	if (itemA === undefined || itemB === undefined) {
		return items;
	}
	const next = [...items];
	next[indexA] = itemB;
	next[indexB] = itemA;
	return next;
}

export function moveSectionUp(
	order: CollectionSection[],
	section: CollectionSection
): CollectionSection[] {
	const index = order.indexOf(section);
	if (index <= 0) {
		return order;
	}
	return swapAt(order, index, index - 1);
}

export function moveSectionDown(
	order: CollectionSection[],
	section: CollectionSection
): CollectionSection[] {
	const index = order.indexOf(section);
	if (index === -1 || index >= order.length - 1) {
		return order;
	}
	return swapAt(order, index, index + 1);
}
