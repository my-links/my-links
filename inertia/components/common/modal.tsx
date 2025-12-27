import clsx from 'clsx';
import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: ReactNode;
	children: ReactNode;
	size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({
	isOpen,
	onClose,
	title,
	children,
	size = 'md',
}: ModalProps) {
	const [isClosing, setIsClosing] = useState(false);
	const [shouldRender, setShouldRender] = useState(false);
	const [isOpening, setIsOpening] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setShouldRender(true);
			setIsClosing(false);
			document.body.style.overflow = 'hidden';
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setIsOpening(true);
				});
			});
		} else if (shouldRender) {
			setIsClosing(true);
			setIsOpening(false);
			const timer = setTimeout(() => {
				setShouldRender(false);
				setIsClosing(false);
			}, 200);
			return () => clearTimeout(timer);
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [isOpen, shouldRender]);

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen && !isClosing) {
				onClose();
			}
		};
		document.addEventListener('keydown', handleEscape);
		return () => {
			document.removeEventListener('keydown', handleEscape);
		};
	}, [isOpen, isClosing, onClose]);

	const handleClose = () => {
		if (!isClosing) {
			onClose();
		}
	};

	if (!shouldRender) return null;

	const sizeClasses = {
		sm: 'max-w-md',
		md: 'max-w-lg',
		lg: 'max-w-2xl',
		xl: 'max-w-4xl',
	};

	const modalContent = (
		<div
			className={clsx(
				'fixed inset-0 z-50 flex items-center justify-center p-4',
				'transition-opacity duration-200',
				isOpening && !isClosing ? 'opacity-100' : 'opacity-0'
			)}
			onClick={handleClose}
		>
			<div
				className={clsx(
					'fixed inset-0 bg-black/50 backdrop-blur-sm',
					'transition-opacity duration-200',
					isOpening && !isClosing ? 'opacity-100' : 'opacity-0'
				)}
				aria-hidden="true"
			/>
			<div
				className={clsx(
					'relative w-full',
					sizeClasses[size],
					'bg-white dark:bg-gray-800 rounded-lg shadow-xl',
					'max-h-[90vh] overflow-hidden flex flex-col',
					'transition-all duration-200',
					isOpening && !isClosing
						? 'opacity-100 scale-100 translate-y-0'
						: 'opacity-0 scale-95 translate-y-2'
				)}
				onClick={(e) => e.stopPropagation()}
			>
				{title && (
					<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
						<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
							{title}
						</h2>
						<button
							onClick={onClose}
							className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
							aria-label="Close"
						>
							<div className="i-mdi-close w-5 h-5" />
						</button>
					</div>
				)}
				<div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
			</div>
		</div>
	);

	return createPortal(modalContent, document.body);
}
