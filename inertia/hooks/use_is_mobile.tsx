const MOBILE_SCREEN_SIZE = 768;

export default function useIsMobile() {
	return (
		typeof window !== 'undefined' &&
		window.matchMedia(`screen and (max-width: ${MOBILE_SCREEN_SIZE}px)`).matches
	);
}
