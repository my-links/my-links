import type { Data } from '@generated/data';

import { COLLECTION_SECTION, type CollectionSection } from './dnd/dnd_types';

type CollectionWithLinks = Data.Collection.Variants['withLinks'];

export type SectionMovePlacement = 'before' | 'after';

type SectionMoveInput = {
	source: CollectionWithLinks[];
	target: CollectionWithLinks[];
	movedId: number;
	anchorId: number | null;
	placement: SectionMovePlacement;
	targetVisibility: CollectionWithLinks['visibility'];
};

export type SectionMovePlan = {
	original: CollectionWithLinks;
	nextSource: CollectionWithLinks[];
	nextTarget: CollectionWithLinks[];
	moved: CollectionWithLinks;
};

export function sectionToVisibility(
	section: CollectionSection
): CollectionWithLinks['visibility'] {
	return section === COLLECTION_SECTION.PUBLIC ? 'PUBLIC' : 'PRIVATE';
}

function resolveInsertIndex(
	anchorIndex: number,
	placement: SectionMovePlacement,
	targetLength: number
): number {
	if (anchorIndex === -1) return targetLength;
	return placement === 'after' ? anchorIndex + 1 : anchorIndex;
}

/** A null `anchorId` appends at the end of the target section. */
export function planSectionMove({
	source,
	target,
	movedId,
	anchorId,
	placement,
	targetVisibility,
}: SectionMoveInput): SectionMovePlan | null {
	const original = source.find((collection) => collection.id === movedId);
	if (!original) return null;

	const moved = { ...original, visibility: targetVisibility };
	const anchorIndex = target.findIndex(
		(collection) => collection.id === anchorId
	);
	const insertIndex = resolveInsertIndex(anchorIndex, placement, target.length);

	return {
		original,
		moved,
		nextSource: source.filter((collection) => collection.id !== movedId),
		nextTarget: [
			...target.slice(0, insertIndex),
			moved,
			...target.slice(insertIndex),
		],
	};
}
