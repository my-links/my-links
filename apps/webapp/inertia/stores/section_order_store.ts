import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
	COLLECTION_SECTION,
	type CollectionSection,
} from '~/lib/dnd/dnd_types';

const DEFAULT_SECTION_ORDER: CollectionSection[] = [
	COLLECTION_SECTION.FOLLOWED,
	COLLECTION_SECTION.PUBLIC,
	COLLECTION_SECTION.PRIVATE,
];

interface SectionOrderStore {
	order: CollectionSection[];
	moveSectionUp: (section: CollectionSection) => void;
	moveSectionDown: (section: CollectionSection) => void;
}

const STORAGE_KEY = 'section-order-preferences';

function swap<TItem>(items: TItem[], indexA: number, indexB: number): TItem[] {
	const next = [...items];
	[next[indexA], next[indexB]] = [next[indexB], next[indexA]];
	return next;
}

export const useSectionOrderStore = create<SectionOrderStore>()(
	persist(
		(set) => ({
			order: DEFAULT_SECTION_ORDER,
			moveSectionUp: (section) =>
				set((state) => {
					const index = state.order.indexOf(section);
					if (index <= 0) {
						return state;
					}
					return { order: swap(state.order, index, index - 1) };
				}),
			moveSectionDown: (section) =>
				set((state) => {
					const index = state.order.indexOf(section);
					if (index === -1 || index >= state.order.length - 1) {
						return state;
					}
					return { order: swap(state.order, index, index + 1) };
				}),
		}),
		{
			name: STORAGE_KEY,
			storage: createJSONStorage(() => localStorage),
		}
	)
);
