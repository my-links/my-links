import clsx from 'clsx';
import { ReactNode, RefObject } from 'react';
import { createPortal } from 'react-dom';

interface MenuPosition {
	x: number;
	y: number;
}

interface ContextMenuProps {
	isVisible: boolean;
	shouldRender: boolean;
	menuPosition: MenuPosition | null;
	menuContentRef: RefObject<HTMLDivElement | null>;
	children: ReactNode;
	onBackdropClick?: () => void;
}

export const ContextMenu = ({
	isVisible,
	shouldRender,
	menuPosition,
	menuContentRef,
	children,
	onBackdropClick,
}: Readonly<ContextMenuProps>) =>
	shouldRender &&
	menuPosition &&
	createPortal(
		<>
			{onBackdropClick && (
				<div
					className="fixed inset-0 z-[998]"
					onClick={onBackdropClick}
					aria-hidden="true"
				/>
			)}
			<div
				ref={menuContentRef}
				className={clsx(
					'w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50 z-[999] py-1 transition-opacity duration-200',
					isVisible ? 'opacity-100' : 'opacity-0'
				)}
				style={{
					position: 'fixed',
					left: `${menuPosition.x}px`,
					top: `${menuPosition.y}px`,
				}}
				onClick={(e) => e.stopPropagation()}
				aria-hidden="true"
			>
				{children}
			</div>
		</>,
		document.body
	);
