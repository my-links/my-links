import { useSyncExternalStore } from 'react';

const subscribeToNothing = () => () => {};

export const useIsClient = () =>
	useSyncExternalStore(
		subscribeToNothing,
		() => true,
		() => false
	);
