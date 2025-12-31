import { ReactNode } from 'react';
import { create } from 'zustand';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';
export type ConfirmModalColor = 'red' | 'blue' | 'green';

const ANIMATION_DURATION_MS = 200;

export interface BaseModalConfig {
	id: string;
	title?: ReactNode;
	size?: ModalSize;
}

export interface StandardModalConfig extends BaseModalConfig {
	type: 'standard';
	children: ReactNode;
}

export interface ConfirmModalConfig extends BaseModalConfig {
	type: 'confirm';
	children?: ReactNode;
	onConfirm: () => void | Promise<void>;
	confirmLabel?: ReactNode;
	cancelLabel?: ReactNode;
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
		set((state) => ({
			modals: [
				...state.modals,
				{
					...config,
					id,
					type: 'standard' as const,
				},
			],
		}));
		return id;
	},

	openConfirm: (config) => {
		const id = generateId();
		set((state) => ({
			modals: [
				...state.modals,
				{
					...config,
					id,
					type: 'confirm' as const,
				},
			],
		}));
		return id;
	},

	close: (id) => {
		const modal = get().modals.find((m) => m.id === id);
		if (!modal) return;

		set((state) => ({
			closingIds: new Set(state.closingIds).add(id),
		}));

		setTimeout(() => {
			set((state) => {
				const updatedClosingIds = new Set(state.closingIds);
				updatedClosingIds.delete(id);
				return {
					modals: state.modals.filter((m) => m.id !== id),
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
		}, ANIMATION_DURATION_MS);
	},

	isOpen: (id) => {
		const state = get();
		return state.modals.some((m) => m.id === id);
	},
}));
