import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Layout = 'list' | 'grid' | 'masonry' | 'compact';

const DEFAULT_LAYOUT = 'list';

interface LayoutsState {
	[key: string]: Layout;
}

interface LayoutStore {
	layouts: LayoutsState;
	setLayoutForKey: (key: string, layout: Layout) => void;
	getLayoutForKey: (key: string) => Layout;
}

const STORAGE_KEY = 'layout-preferences';

const useLayoutStoreBase = create<LayoutStore>()(
	persist(
		(set, get) => ({
			layouts: {},
			setLayoutForKey: (key: string, layout: Layout) =>
				set((state) => ({
					layouts: {
						...state.layouts,
						[key]: layout,
					},
				})),
			getLayoutForKey: (key: string) => {
				const state = get();
				return state.layouts[key] || DEFAULT_LAYOUT;
			},
		}),
		{
			name: STORAGE_KEY,
			storage: createJSONStorage(() => localStorage),
		}
	)
);

export const useLayoutStore = (key: string) => {
	const { getLayoutForKey, setLayoutForKey } = useLayoutStoreBase();
	return {
		layout: getLayoutForKey(key),
		setLayout: (layout: Layout) => setLayoutForKey(key, layout),
	};
};
