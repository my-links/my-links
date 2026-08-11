import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { useDashboardLayoutStore } from '~/stores/dashboard_layout_store';

interface TourStore {
	hasCompletedDashboardTour: boolean;
	run: boolean;
	stepIndex: number;
	startTour: () => void;
	advanceStep: (stepIndex: number) => void;
	stopTour: () => void;
}

const STORAGE_KEY = 'tour-preferences';

export const useTourStore = create<TourStore>()(
	persist(
		(set) => ({
			hasCompletedDashboardTour: false,
			run: false,
			stepIndex: 0,
			startTour: () => {
				// Sidebar-targeted steps need the sidebar open, or Joyride hangs on a missing target.
				useDashboardLayoutStore.getState().setSidebarOpen(true);
				set({ run: true, stepIndex: 0 });
			},
			advanceStep: (stepIndex) => set({ stepIndex }),
			stopTour: () =>
				set({ run: false, stepIndex: 0, hasCompletedDashboardTour: true }),
		}),
		{
			name: STORAGE_KEY,
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				hasCompletedDashboardTour: state.hasCompletedDashboardTour,
			}),
		}
	)
);
