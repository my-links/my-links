import { useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

const REFETCH_THROTTLE_MS = 1000;

/** Reloads the current Inertia page props when the tab or window regains focus, so data edited elsewhere (another tab/device) isn't shown stale. */
export function useRefetchOnTabRefocus(): void {
	const lastReloadAtRef = useRef(0);

	useEffect(() => {
		const reloadIfDue = () => {
			const now = Date.now();
			if (now - lastReloadAtRef.current < REFETCH_THROTTLE_MS) return;
			lastReloadAtRef.current = now;
			router.reload();
		};

		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') reloadIfDue();
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);
		window.addEventListener('focus', reloadIfDue);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			window.removeEventListener('focus', reloadIfDue);
		};
	}, []);
}
