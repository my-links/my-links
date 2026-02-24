import { useEffect, useState } from 'react';
import { MOBILE_BREAKPOINT } from '~/consts/breakpoints';

export const useIsMobile = () => {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
		setIsMobile(mediaQuery.matches);

		const handleChange = (e: MediaQueryListEvent) => {
			setIsMobile(e.matches);
		};

		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	}, []);

	return isMobile;
};
