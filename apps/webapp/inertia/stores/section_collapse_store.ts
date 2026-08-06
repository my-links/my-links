import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
	COLLECTION_SECTION,
	type CollectionSection,
} from '~/lib/dnd/dnd_types';

const ALL_SECTIONS: CollectionSection[] = [
	COLLECTION_SECTION.FOLLOWED,
	COLLECTION_SECTION.PUBLIC,
	COLLECTION_SECTION.PRIVATE,
];

const DEFAULT_EXPANDED: Record<CollectionSection, boolean> = {
	[COLLECTION_SECTION.FOLLOWED]: true,
	[COLLECTION_SECTION.PUBLIC]: true,
	[COLLECTION_SECTION.PRIVATE]: true,
};

interface SectionCollapseStore {
	expanded: Record<CollectionSection, boolean>;
	toggleSection: (section: CollectionSection) => void;
	collapseAll: () => void;
	expandAll: () => void;
}

const STORAGE_KEY = 'section-collapse-preferences';

export const useSectionCollapseStore = create<SectionCollapseStore>()(
	persist(
		(set) => ({
			expanded: DEFAULT_EXPANDED,
			toggleSection: (section) =>
				set((state) => ({
					expanded: {
						...state.expanded,
						[section]: !state.expanded[section],
					},
				})),
			collapseAll: () =>
				set(() => ({
					expanded: Object.fromEntries(
						ALL_SECTIONS.map((section) => [section, false])
					) as Record<CollectionSection, boolean>,
				})),
			expandAll: () =>
				set(() => ({
					expanded: Object.fromEntries(
						ALL_SECTIONS.map((section) => [section, true])
					) as Record<CollectionSection, boolean>,
				})),
		}),
		{
			name: STORAGE_KEY,
			storage: createJSONStorage(() => localStorage),
		}
	)
);
