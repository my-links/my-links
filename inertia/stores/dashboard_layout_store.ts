import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type DashboardLayout = 'list' | 'grid' | 'masonry' | 'compact';

const SIDEBAR_MIN_WIDTH = 200;
const SIDEBAR_MAX_WIDTH = 500;
const SIDEBAR_DEFAULT_WIDTH = 256;
const DEFAULT_LAYOUT = 'list';

interface DashboardLayoutStore {
	layout: DashboardLayout;
	setLayout: (layout: DashboardLayout) => void;
	sidebarOpen: boolean;
	setSidebarOpen: (open: boolean) => void;
	toggleSidebar: () => void;
	sidebarWidth: number;
	setSidebarWidth: (width: number) => void;
}

const STORAGE_KEY = 'dashboard-layout-preferences';

export const useDashboardLayoutStore = create<DashboardLayoutStore>()(
	persist(
		(set) => ({
			layout: DEFAULT_LAYOUT,
			setLayout: (layout) => set({ layout }),
			sidebarOpen: true,
			setSidebarOpen: (open) => set({ sidebarOpen: open }),
			toggleSidebar: () =>
				set((state) => ({ sidebarOpen: !state.sidebarOpen })),
			sidebarWidth: SIDEBAR_DEFAULT_WIDTH,
			setSidebarWidth: (width) =>
				set({
					sidebarWidth: Math.max(
						SIDEBAR_MIN_WIDTH,
						Math.min(SIDEBAR_MAX_WIDTH, width)
					),
				}),
		}),
		{
			name: STORAGE_KEY,
			storage: createJSONStorage(() => localStorage),
		}
	)
);

export { SIDEBAR_MAX_WIDTH, SIDEBAR_MIN_WIDTH };
