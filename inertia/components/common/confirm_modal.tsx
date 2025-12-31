import { ReactNode, useState } from 'react';
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
	confirmLabel = 'Confirm',
	cancelLabel = 'Cancel',
	confirmColor = 'blue',
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

	const colorClasses = {
		red: 'bg-red-600 hover:bg-red-700',
		blue: 'bg-blue-600 hover:bg-blue-700',
		green: 'bg-green-600 hover:bg-green-700',
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
			<div className="space-y-4">
				{children && (
					<div className="text-sm text-gray-600 dark:text-gray-300">
						{children}
					</div>
				)}
				<div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
					<button
						type="button"
						onClick={onClose}
						disabled={loading || isConfirming}
						className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{cancelLabel}
					</button>
					<button
						type="button"
						onClick={handleConfirm}
						disabled={loading || isConfirming}
						className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${colorClasses[confirmColor]}`}
					>
						{loading || isConfirming ? (
							<span className="flex items-center gap-2">
								<span className="i-svg-spinners-3-dots-fade w-4 h-4" />
								{confirmLabel}
							</span>
						) : (
							confirmLabel
						)}
					</button>
				</div>
			</div>
		</Modal>
	);
}
