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
	onBackdropClick: () => void;
	children: ReactNode;
}

const MENU_BASE_CLASSES =
	'w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50 z-999 py-1 transition-opacity duration-200';

export function ContextMenu({
	isVisible,
	shouldRender,
	menuPosition,
	menuContentRef,
	onBackdropClick,
	children,
}: ContextMenuProps) {
	if (!shouldRender) return null;

	const menuContent = (
		<>
			<div className="fixed inset-0 z-10" onClick={onBackdropClick} />
			<div
				ref={menuContentRef}
				className={clsx(
					MENU_BASE_CLASSES,
					isVisible ? 'opacity-100' : 'opacity-0',
					menuPosition ? 'fixed' : 'absolute right-0 top-full mt-1'
				)}
				style={
					menuPosition
						? {
								left: `${menuPosition.x}px`,
								top: `${menuPosition.y}px`,
							}
						: undefined
				}
				onClick={(e) => e.stopPropagation()}
			>
				{children}
			</div>
		</>
	);

	if (menuPosition) {
		return createPortal(menuContent, document.body);
	}

	return menuContent;
}
