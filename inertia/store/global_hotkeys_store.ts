import { create } from 'zustand';

interface GlobalHotkeysStore {
	globalHotkeysEnabled: boolean;
	setGlobalHotkeysEnabled: (value: boolean) => void;
}

export const useGlobalHotkeysStore = create<GlobalHotkeysStore>((set) => ({
	globalHotkeysEnabled: true,
	setGlobalHotkeysEnabled: (value) => set({ globalHotkeysEnabled: value }),
}));
