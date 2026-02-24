import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MOBILE_BREAKPOINT } from '~/consts/breakpoints';

const SIDEBAR_MIN_WIDTH = 200;
const SIDEBAR_MAX_WIDTH = 500;
const SIDEBAR_DEFAULT_WIDTH = 256;

interface DashboardLayoutStore {
	sidebarOpen: boolean;
	setSidebarOpen: (open: boolean) => void;
	toggleSidebar: () => void;
	sidebarWidth: number;
	setSidebarWidth: (width: number) => void;
}

const STORAGE_KEY = 'dashboard-layout-preferences';

const getDefaultSidebarOpen = (): boolean => {
	if (typeof window === 'undefined') return true;
	return window.innerWidth > MOBILE_BREAKPOINT;
};

export const useDashboardLayoutStore = create<DashboardLayoutStore>()(
	persist(
		(set) => ({
			sidebarOpen: getDefaultSidebarOpen(),
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
			merge: (persistedState, currentState) => {
				if (
					!persistedState ||
					typeof persistedState !== 'object' ||
					!('sidebarOpen' in persistedState)
				) {
					return {
						...currentState,
						sidebarOpen: getDefaultSidebarOpen(),
					};
				}
				return {
					...currentState,
					...(persistedState as Partial<DashboardLayoutStore>),
				};
			},
		}
	)
);

export { SIDEBAR_MAX_WIDTH, SIDEBAR_MIN_WIDTH };
