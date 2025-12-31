import { ReactNode, useState } from 'react';
import { ConfirmModal } from '~/components/common/confirm_modal';
import { Modal } from '~/components/common/modal';

interface ModalState {
	id: string;
	title?: ReactNode;
	children: ReactNode;
	size?: 'sm' | 'md' | 'lg' | 'xl';
}

interface ConfirmModalState {
	id: string;
	title: ReactNode;
	children?: ReactNode;
	onConfirm: () => void | Promise<void>;
	confirmLabel?: ReactNode;
	cancelLabel?: ReactNode;
	confirmColor?: 'red' | 'blue' | 'green';
}

export function useModals() {
	const [modals, setModals] = useState<ModalState[]>([]);
	const [confirmModals, setConfirmModals] = useState<ConfirmModalState[]>([]);

	const open = (options: {
		title?: ReactNode;
		children: ReactNode;
		size?: 'sm' | 'md' | 'lg' | 'xl';
	}) => {
		const id = Math.random().toString(36).substring(7);
		setModals((prev) => [
			...prev,
			{
				id,
				title: options.title,
				children: options.children,
				size: options.size,
			},
		]);
		return id;
	};

	const openConfirmModal = (options: {
		title: ReactNode;
		children?: ReactNode;
		onConfirm: () => void | Promise<void>;
		confirmLabel?: ReactNode;
		cancelLabel?: ReactNode;
		confirmColor?: 'red' | 'blue' | 'green';
	}) => {
		const id = Math.random().toString(36).substring(7);
		setConfirmModals((prev) => [
			...prev,
			{
				id,
				title: options.title,
				children: options.children,
				onConfirm: options.onConfirm,
				confirmLabel: options.confirmLabel,
				cancelLabel: options.cancelLabel,
				confirmColor: options.confirmColor,
			},
		]);
		return id;
	};

	const close = (id: string) => {
		setModals((prev) => prev.filter((m) => m.id !== id));
	};

	const closeConfirm = (id: string) => {
		setConfirmModals((prev) => prev.filter((m) => m.id !== id));
	};

	const closeAll = () => {
		setModals([]);
		setConfirmModals([]);
	};

	const Modals = () => (
		<>
			{modals.map((modal) => (
				<Modal
					key={modal.id}
					isOpen={true}
					onClose={() => close(modal.id)}
					title={modal.title}
					size={modal.size}
				>
					{modal.children}
				</Modal>
			))}
			{confirmModals.map((modal) => (
				<ConfirmModal
					key={modal.id}
					isOpen={true}
					onClose={() => closeConfirm(modal.id)}
					onConfirm={async () => {
						await modal.onConfirm();
						closeConfirm(modal.id);
					}}
					title={modal.title}
					confirmLabel={modal.confirmLabel}
					cancelLabel={modal.cancelLabel}
					confirmColor={modal.confirmColor}
				>
					{modal.children}
				</ConfirmModal>
			))}
		</>
	);

	return {
		open,
		openConfirmModal,
		close,
		closeAll,
		Modals,
	};
}
