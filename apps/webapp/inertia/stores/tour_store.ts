import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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
			startTour: () => set({ run: true, stepIndex: 0 }),
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
