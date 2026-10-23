import { useSyncExternalStore } from 'react';

import { MOBILE_BREAKPOINT } from '~/consts/breakpoints';

const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT}px)`;

const subscribeToMobileChange = (onChange: () => void) => {
	const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
	mediaQuery.addEventListener('change', onChange);
	return () => mediaQuery.removeEventListener('change', onChange);
};

const readIsMobile = () => window.matchMedia(MOBILE_MEDIA_QUERY).matches;

export const useIsMobile = () =>
	useSyncExternalStore(subscribeToMobileChange, readIsMobile, () => false);
