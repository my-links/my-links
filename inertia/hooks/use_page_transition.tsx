import { useEffect, useRef } from 'react';
import {
	getCurrentPathAndSearch,
	getUrlPathname,
	restartCssAnimation,
} from '~/lib/navigation';
import { InertiaSuccessEvent } from '~/types/inertia';

const PAGE_TRANSITION_CLASS = 'page-transition-enter';

interface UsePageTransitionProps {
	querySelector: string;
}

export const usePageTransition = ({
	querySelector,
}: UsePageTransitionProps): void => {
	const previousUrlRef = useRef<string>(getCurrentPathAndSearch());

	useEffect(() => {
		const handleSuccess = (event: Event) => {
			const element = document.querySelector(
				querySelector
			) as HTMLElement | null;
			if (!element) return;

			const { detail } = event as InertiaSuccessEvent;
			const nextUrlRaw = detail?.page?.url ?? getCurrentPathAndSearch();

			const next = getUrlPathname(nextUrlRaw);
			const prev = previousUrlRef.current;
			if (next === prev) return;

			previousUrlRef.current = next;
			restartCssAnimation(element, PAGE_TRANSITION_CLASS);

			const onEnd = () => {
				element.classList.remove(PAGE_TRANSITION_CLASS);
				element.removeEventListener('animationend', onEnd);
			};
			element.addEventListener('animationend', onEnd);
		};

		document.addEventListener(
			'inertia:success',
			handleSuccess as EventListener
		);
		return () =>
			document.removeEventListener(
				'inertia:success',
				handleSuccess as EventListener
			);
	}, [querySelector]);
};
