import clsx from 'clsx';
import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconButton } from './icon_button';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: ReactNode;
	children: ReactNode;
	size?: 'sm' | 'md' | 'lg' | 'xl';
	className?: string;
}

const ANIMATION_DURATION_MS = 200;
const SIZE_CLASSES = {
	sm: 'max-w-md',
	md: 'max-w-lg',
	lg: 'max-w-2xl',
	xl: 'max-w-4xl',
} as const;

export function Modal({
	isOpen,
	onClose,
	title,
	children,
	size = 'md',
	className,
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
			}, ANIMATION_DURATION_MS);

			return () => clearTimeout(timer);
		}

		return () => {
			if (!isOpen && !shouldRender) {
				document.body.style.overflow = '';
			}
		};
	}, [isOpen, shouldRender]);

	useEffect(() => {
		if (!isOpen || isClosing) return;

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [isOpen, isClosing, onClose]);

	const handleBackdropClick = () => {
		if (!isClosing) {
			onClose();
		}
	};

	if (!shouldRender) return null;

	const isVisible = isOpening && !isClosing;

	return createPortal(
		<div
			className={clsx(
				'fixed inset-0 z-50 h-fit flex justify-center p-4 mt-32',
				'transition-opacity duration-200',
				isVisible ? 'opacity-100' : 'opacity-0'
			)}
			onClick={handleBackdropClick}
		>
			<div
				className={clsx(
					'fixed inset-0 bg-black/50 backdrop-blur-sm',
					'transition-opacity duration-200',
					isVisible ? 'opacity-100' : 'opacity-0'
				)}
				aria-hidden="true"
			/>
			<div
				className={clsx(
					'relative w-full',
					SIZE_CLASSES[size],
					'bg-white dark:bg-gray-800 rounded-lg shadow-xl',
					'max-h-[90vh] overflow-hidden flex flex-col',
					'transition-all duration-200',
					isVisible
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
						<IconButton
							icon="i-mdi-close"
							onClick={onClose}
							aria-label="Close"
							variant="ghost"
							className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
						/>
					</div>
				)}
				<div className={clsx('flex-1 overflow-y-auto px-6 py-4', className)}>
					{children}
				</div>
			</div>
		</div>,
		document.body
	);
}
