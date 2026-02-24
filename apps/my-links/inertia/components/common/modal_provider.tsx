import { Modal } from '@minimalstuff/ui';
import { ConfirmModal } from '~/components/common/confirm_modal';
import { useModalStore } from '~/stores/modal_store';

export function ModalProvider() {
	const modals = useModalStore((state) => state.modals);
	const closingIds = useModalStore((state) => state.closingIds);
	const isOpen = useModalStore((state) => state.isOpen);
	const close = useModalStore((state) => state.close);

	return (
		<>
			{modals.map((modal) => {
				const modalIsOpen = isOpen(modal.id) && !closingIds.has(modal.id);

				if (modal.type === 'confirm') {
					return (
						<ConfirmModal
							key={modal.id}
							isOpen={modalIsOpen}
							onClose={() => close(modal.id)}
							onConfirm={async () => {
								await modal.onConfirm();
								close(modal.id);
							}}
							title={modal.title!}
							confirmLabel={modal.confirmLabel}
							cancelLabel={modal.cancelLabel}
							confirmColor={modal.confirmColor}
						>
							{modal.children}
						</ConfirmModal>
					);
				}

				return (
					<Modal
						key={modal.id}
						isOpen={modalIsOpen}
						onClose={() => close(modal.id)}
						title={modal.title}
						size={modal.size}
					>
						{modal.children}
					</Modal>
				);
			})}
		</>
	);
}
