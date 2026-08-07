import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AnnouncementStore {
	dismissedMajorVersion: number;
	dismiss: (majorVersion: number) => void;
}

const STORAGE_KEY = 'announcement-preferences';

// v5 is the first release with a changelog, so seed the baseline at 4 to skip announcing it retroactively.
const LAST_MAJOR_VERSION_WITHOUT_ANNOUNCEMENT = 4;

export const useAnnouncementStore = create<AnnouncementStore>()(
	persist(
		(set) => ({
			dismissedMajorVersion: LAST_MAJOR_VERSION_WITHOUT_ANNOUNCEMENT,
			dismiss: (majorVersion) => set({ dismissedMajorVersion: majorVersion }),
		}),
		{
			name: STORAGE_KEY,
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				dismissedMajorVersion: state.dismissedMajorVersion,
			}),
		}
	)
);
