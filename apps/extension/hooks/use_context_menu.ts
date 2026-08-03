import type { MouseEvent as ReactMouseEvent } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useClickOutside } from '@/hooks/use_click_outside';
import { useStateAnimation } from '@/hooks/use_state_animation';

interface UseContextMenuProps {
	onClose?: () => void;
}

interface MenuPosition {
	x: number;
	y: number;
}

const MENU_PADDING = 8;

function adjustPosition(
	x: number,
	y: number,
	menuWidth: number,
	menuHeight: number
): MenuPosition {
	let adjustedX = x;
	let adjustedY = y;

	if (x + menuWidth + MENU_PADDING > window.innerWidth) {
		adjustedX = window.innerWidth - menuWidth - MENU_PADDING;
	}
	if (x < MENU_PADDING) {
		adjustedX = MENU_PADDING;
	}

	if (y + menuHeight + MENU_PADDING > window.innerHeight) {
		adjustedY = window.innerHeight - menuHeight - MENU_PADDING;
	}
	if (y < MENU_PADDING) {
		adjustedY = MENU_PADDING;
	}

	return { x: adjustedX, y: adjustedY };
}

export function useContextMenu({
	onClose,
}: Readonly<UseContextMenuProps> = {}) {
	const [isOpen, setIsOpen] = useState(false);
	const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
	const menuRef = useRef<HTMLDivElement>(null);
	const menuContentRef = useRef<HTMLDivElement>(null);
	const { shouldRender, isVisible } = useStateAnimation(isOpen);
	const pendingPositionRef = useRef<MenuPosition | null>(null);

	const openMenu = (position: MenuPosition) => {
		pendingPositionRef.current = position;
		setMenuPosition(position);
		setIsOpen(true);
	};

	const closeMenu = () => {
		setIsOpen(false);
		onClose?.();
	};

	const handleContextMenu = (event: ReactMouseEvent) => {
		event.preventDefault();
		openMenu({ x: event.clientX, y: event.clientY });
	};

	useClickOutside({
		ref: menuRef,
		additionalRefs: [menuContentRef],
		onClickOutside: closeMenu,
		enabled: isOpen,
	});

	useLayoutEffect(() => {
		if (
			!shouldRender ||
			!menuContentRef.current ||
			!pendingPositionRef.current
		) {
			return;
		}

		const measureMenu = () => {
			if (!menuContentRef.current || !pendingPositionRef.current) return;

			const rect = menuContentRef.current.getBoundingClientRect();

			if (rect.width > 0 && rect.height > 0) {
				const adjusted = adjustPosition(
					pendingPositionRef.current.x,
					pendingPositionRef.current.y,
					rect.width,
					rect.height
				);
				setMenuPosition(adjusted);
				pendingPositionRef.current = null;
			} else {
				requestAnimationFrame(measureMenu);
			}
		};

		requestAnimationFrame(measureMenu);
	}, [shouldRender]);

	useEffect(() => {
		if (!shouldRender && !isOpen && menuPosition) {
			setMenuPosition(null);
		}
	}, [shouldRender, isOpen, menuPosition]);

	return {
		shouldRender,
		isVisible,
		menuRef,
		menuPosition,
		menuContentRef,
		closeMenu,
		handleContextMenu,
	};
}
