import { t } from '@lingui/core/macro';
import { ReactNode, useState } from 'react';
import { Button } from './button';
import { Modal } from './modal';

interface ConfirmModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void | Promise<void>;
	title: ReactNode;
	children?: ReactNode;
	confirmLabel?: ReactNode;
	cancelLabel?: ReactNode;
	confirmColor?: 'red' | 'blue' | 'green';
	loading?: boolean;
}

export function ConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	title,
	children,
	confirmLabel: propConfirmLabel,
	cancelLabel: propCancelLabel,
	confirmColor: propConfirmColor,
	loading = false,
}: ConfirmModalProps) {
	const [isConfirming, setIsConfirming] = useState(false);

	const handleConfirm = async () => {
		setIsConfirming(true);
		try {
			await onConfirm();
		} finally {
			setIsConfirming(false);
		}
	};

	const isDisabled = loading || isConfirming;

	const confirmLabel = propConfirmLabel ?? t`Confirm`;
	const cancelLabel = propCancelLabel ?? t`Cancel`;
	const confirmColor = propConfirmColor ?? 'blue';
	return (
		<Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
			<div className="space-y-4">
				{children && (
					<div className="text-sm text-gray-600 dark:text-gray-300">
						{children}
					</div>
				)}
				<div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
					<Button variant="secondary" onClick={onClose} disabled={isDisabled}>
						{cancelLabel}
					</Button>
					<Button
						variant={confirmColor === 'red' ? 'danger' : 'primary'}
						onClick={handleConfirm}
						loading={isDisabled}
						disabled={isDisabled}
					>
						{confirmLabel}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
