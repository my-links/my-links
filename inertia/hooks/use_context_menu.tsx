import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useClickOutside } from './use_click_outside';
import { useStateAnimation } from './use_state_animation';

interface UseContextMenuOptions {
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

export function useContextMenu({ onClose }: UseContextMenuOptions = {}) {
	const [isOpen, setIsOpen] = useState(false);
	const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
	const [menuDimensions, setMenuDimensions] = useState({ width: 0, height: 0 });
	const menuRef = useRef<HTMLDivElement>(null);
	const menuContentRef = useRef<HTMLDivElement>(null);
	const { shouldRender, isVisible } = useStateAnimation(isOpen);
	const pendingPositionRef = useRef<MenuPosition | null>(null);

	const openMenu = (position?: MenuPosition) => {
		if (position) {
			pendingPositionRef.current = position;
			setMenuPosition(position);
		} else {
			setMenuPosition(null);
			pendingPositionRef.current = null;
		}
		setIsOpen(true);
	};

	const closeMenu = () => {
		setIsOpen(false);
		onClose?.();
	};

	const toggleMenu = () => {
		if (isOpen) {
			closeMenu();
		} else {
			setMenuPosition(null);
			setIsOpen(true);
		}
	};

	const handleContextMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		openMenu({ x: e.clientX, y: e.clientY });
	};

	useClickOutside({
		ref: menuRef,
		additionalRefs: [menuContentRef],
		onClickOutside: closeMenu,
		enabled: isOpen,
	});

	useLayoutEffect(() => {
		if (shouldRender && menuContentRef.current && pendingPositionRef.current) {
			const measureMenu = () => {
				if (!menuContentRef.current || !pendingPositionRef.current) return;

				const rect = menuContentRef.current.getBoundingClientRect();
				const dimensions = {
					width: rect.width,
					height: rect.height,
				};

				if (dimensions.width > 0 && dimensions.height > 0) {
					setMenuDimensions(dimensions);
					const adjusted = adjustPosition(
						pendingPositionRef.current.x,
						pendingPositionRef.current.y,
						dimensions.width,
						dimensions.height
					);
					setMenuPosition(adjusted);
					pendingPositionRef.current = null;
				} else {
					requestAnimationFrame(measureMenu);
				}
			};

			requestAnimationFrame(measureMenu);
		}
	}, [shouldRender]);

	useEffect(() => {
		if (!shouldRender && !isOpen && menuPosition) {
			setMenuDimensions({ width: 0, height: 0 });
			setMenuPosition(null);
		}
	}, [shouldRender, isOpen, menuPosition]);

	return {
		isOpen,
		menuPosition,
		menuDimensions,
		shouldRender,
		isVisible,
		menuRef,
		menuContentRef,
		openMenu,
		closeMenu,
		toggleMenu,
		handleContextMenu,
	};
}
