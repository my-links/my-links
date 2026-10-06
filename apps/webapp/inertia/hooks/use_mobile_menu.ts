import { useEffect, useState } from 'react';

import { NAVBAR_BREAKPOINT } from '~/consts/breakpoints';

type UseMobileMenuReturn = {
	isMobileMenuOpen: boolean;
	toggleMobileMenu: () => void;
	closeMobileMenu: () => void;
};

export function useMobileMenu(): UseMobileMenuReturn {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen((prev) => !prev);
	};

	const closeMobileMenu = () => {
		setIsMobileMenuOpen(false);
	};

	useEffect(() => {
		if (typeof window === 'undefined') return;

		let observer: ResizeObserver | null = null;

		const checkAndCloseMenu = () => {
			if (window.innerWidth >= NAVBAR_BREAKPOINT) {
				closeMobileMenu();
			}
		};

		observer = new ResizeObserver(() => {
			checkAndCloseMenu();
		});

		observer.observe(document.body);

		return () => {
			if (observer) {
				observer.disconnect();
			}
		};
	}, []);

	return { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu };
}
