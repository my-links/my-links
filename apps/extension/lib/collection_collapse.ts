import {
	COLLECTION_SECTION,
	type CollectionSection,
} from '@/lib/dnd/dnd_types';

export interface CollectionCollapseState {
	sections: Record<CollectionSection, boolean>;
	collections: Record<number, boolean>;
}

/**
 * Followed defaults collapsed — a follower opens the extension for their own
 * links far more often than someone else's, and a large followed collection
 * shouldn't push those below the fold on every open.
 */
export const SECTION_DEFAULT_EXPANDED: Record<CollectionSection, boolean> = {
	[COLLECTION_SECTION.FOLLOWED]: false,
	[COLLECTION_SECTION.PUBLIC]: true,
	[COLLECTION_SECTION.PRIVATE]: true,
};

export const DEFAULT_COLLECTION_COLLAPSE_STATE: CollectionCollapseState = {
	sections: SECTION_DEFAULT_EXPANDED,
	collections: {},
};

export function isSectionExpanded(
	state: CollectionCollapseState,
	section: CollectionSection
): boolean {
	return state.sections[section] ?? SECTION_DEFAULT_EXPANDED[section];
}

export function isCollectionExpanded(
	state: CollectionCollapseState,
	collectionId: number
): boolean {
	return state.collections[collectionId] ?? true;
}

export function toggleSection(
	state: CollectionCollapseState,
	section: CollectionSection
): CollectionCollapseState {
	return {
		...state,
		sections: {
			...state.sections,
			[section]: !isSectionExpanded(state, section),
		},
	};
}

export function toggleSectionRecursive(
	state: CollectionCollapseState,
	section: CollectionSection,
	collectionIds: number[]
): CollectionCollapseState {
	const nextExpanded = !isSectionExpanded(state, section);
	return {
		sections: {
			...state.sections,
			[section]: nextExpanded,
		},
		collections: {
			...state.collections,
			...Object.fromEntries(
				collectionIds.map((collectionId) => [collectionId, nextExpanded])
			),
		},
	};
}

export function toggleCollection(
	state: CollectionCollapseState,
	collectionId: number
): CollectionCollapseState {
	return {
		...state,
		collections: {
			...state.collections,
			[collectionId]: !isCollectionExpanded(state, collectionId),
		},
	};
}

export function collapseAll(
	state: CollectionCollapseState,
	sections: CollectionSection[],
	collectionIds: number[]
): CollectionCollapseState {
	return setAllExpanded(state, sections, collectionIds, false);
}

export function expandAll(
	state: CollectionCollapseState,
	sections: CollectionSection[],
	collectionIds: number[]
): CollectionCollapseState {
	return setAllExpanded(state, sections, collectionIds, true);
}

function setAllExpanded(
	state: CollectionCollapseState,
	sections: CollectionSection[],
	collectionIds: number[],
	isExpanded: boolean
): CollectionCollapseState {
	return {
		sections: {
			...state.sections,
			...Object.fromEntries(sections.map((section) => [section, isExpanded])),
		},
		collections: {
			...state.collections,
			...Object.fromEntries(
				collectionIds.map((collectionId) => [collectionId, isExpanded])
			),
		},
	};
}
