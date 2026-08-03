import clsx from 'clsx';
import { createPortal } from 'react-dom';
import type { ReactNode, RefObject } from 'react';

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
	onBackdropClick: () => void;
}

export function ContextMenu({
	isVisible,
	shouldRender,
	menuPosition,
	menuContentRef,
	children,
	onBackdropClick,
}: Readonly<ContextMenuProps>) {
	if (!shouldRender || !menuPosition) return null;

	return createPortal(
		<>
			<div
				className="fixed inset-0 z-[998]"
				onClick={onBackdropClick}
				aria-hidden="true"
			/>
			<div
				ref={menuContentRef}
				className={clsx(
					'z-[999] w-40 rounded-lg border border-gray-200/50 bg-white/95 py-1 shadow-lg backdrop-blur-sm transition-opacity duration-150 dark:border-gray-700/50 dark:bg-gray-800/95',
					isVisible ? 'opacity-100' : 'opacity-0'
				)}
				style={{
					position: 'fixed',
					left: `${menuPosition.x}px`,
					top: `${menuPosition.y}px`,
				}}
				onClick={(event) => event.stopPropagation()}
			>
				{children}
			</div>
		</>,
		document.body
	);
}
