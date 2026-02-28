import { create } from 'zustand';
import { useGlobalHotkeysStore } from './global_hotkeys_store';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';
export type ConfirmModalColor = 'red' | 'blue' | 'green';

const ANIMATION_DURATION_MS = 200;

export interface BaseModalConfig {
	id: string;
	title?: React.ReactNode;
	size?: ModalSize;
}

export interface StandardModalConfig extends BaseModalConfig {
	type: 'standard';
	children: React.ReactNode;
}

export interface ConfirmModalConfig extends BaseModalConfig {
	type: 'confirm';
	children?: React.ReactNode;
	onConfirm: () => void | Promise<void>;
	confirmLabel?: React.ReactNode;
	cancelLabel?: React.ReactNode;
	confirmColor?: ConfirmModalColor;
}

export type ModalConfig = StandardModalConfig | ConfirmModalConfig;

interface ModalStore {
	modals: ModalConfig[];
	closingIds: Set<string>;
	open: (config: Omit<StandardModalConfig, 'id' | 'type'>) => string;
	openConfirm: (config: Omit<ConfirmModalConfig, 'id' | 'type'>) => string;
	close: (id: string) => void;
	closeAll: () => void;
	isOpen: (id: string) => boolean;
}

const generateId = (): string => Math.random().toString(36).substring(7);

export const useModalStore = create<ModalStore>((set, get) => ({
	modals: [],
	closingIds: new Set(),

	open: (config) => {
		const id = generateId();
		const state = get();
		const wasEmpty = state.modals.length === 0;

		set({
			modals: [
				...state.modals,
				{
					...config,
					id,
					type: 'standard' as const,
				},
			],
		});

		if (wasEmpty) {
			useGlobalHotkeysStore.getState().setGlobalHotkeysEnabled(false);
		}

		return id;
	},

	openConfirm: (config) => {
		const id = generateId();
		const state = get();
		const wasEmpty = state.modals.length === 0;

		set({
			modals: [
				...state.modals,
				{
					...config,
					id,
					type: 'confirm' as const,
				},
			],
		});

		if (wasEmpty) {
			useGlobalHotkeysStore.getState().setGlobalHotkeysEnabled(false);
		}

		return id;
	},

	close: (id) => {
		const modal = get().modals.find((m) => m.id === id);
		if (!modal) return;

		const state = get();
		const willBeEmpty = state.modals.length === 1;

		set((_state: ModalStore) => ({
			closingIds: new Set(_state.closingIds).add(id),
		}));

		setTimeout(() => {
			set((_state) => {
				const updatedClosingIds = new Set(_state.closingIds);
				updatedClosingIds.delete(id);
				const newModals = _state.modals.filter((m) => m.id !== id);

				if (willBeEmpty && newModals.length === 0) {
					useGlobalHotkeysStore.getState().setGlobalHotkeysEnabled(true);
				}

				return {
					modals: newModals,
					closingIds: updatedClosingIds,
				};
			});
		}, ANIMATION_DURATION_MS);
	},

	closeAll: () => {
		const currentModals = get().modals;
		if (currentModals.length === 0) return;

		const allIds = new Set(currentModals.map((m) => m.id));
		set({ closingIds: allIds });

		setTimeout(() => {
			set({ modals: [], closingIds: new Set() });
			useGlobalHotkeysStore.getState().setGlobalHotkeysEnabled(true);
		}, ANIMATION_DURATION_MS);
	},

	isOpen: (id) => {
		const state = get();
		return state.modals.some((m) => m.id === id);
	},
}));
