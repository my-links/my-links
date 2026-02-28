import { RefObject, useEffect } from 'react';

interface UseClickOutsideProps {
	ref: RefObject<HTMLElement | null>;
	additionalRefs?: RefObject<HTMLElement | null>[];
	onClickOutside: () => void;
	enabled?: boolean;
}

export function useClickOutside({
	ref,
	additionalRefs = [],
	onClickOutside,
	enabled = true,
}: Readonly<UseClickOutsideProps>) {
	useEffect(() => {
		if (!enabled) return;

		const handleClickOutside = (event: MouseEvent | globalThis.MouseEvent) => {
			const target = event.target as Node;
			const isInsideRef = ref.current?.contains(target);
			const isInsideAdditional = additionalRefs.some((additionalRef) =>
				additionalRef.current?.contains(target)
			);

			if (!isInsideRef && !isInsideAdditional) {
				onClickOutside();
			}
		};

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClickOutside();
			}
		};

		document.addEventListener('mousedown', handleClickOutside as any);
		document.addEventListener('keydown', handleEscape);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside as any);
			document.removeEventListener('keydown', handleEscape);
		};
	}, [ref, additionalRefs, onClickOutside, enabled]);
}
