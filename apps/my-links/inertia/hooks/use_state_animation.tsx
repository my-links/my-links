import { useEffect, useState } from 'react';

export function useStateAnimation(isOpen: boolean, duration = 150) {
	const [isClosing, setIsClosing] = useState(false);
	const [shouldRender, setShouldRender] = useState(false);
	const [isOpening, setIsOpening] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setShouldRender(true);
			setIsClosing(false);
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setIsOpening(true);
				});
			});
		} else if (shouldRender) {
			setIsClosing(true);
			setIsOpening(false);
			const timer = setTimeout(() => {
				setShouldRender(false);
				setIsClosing(false);
			}, duration);
			return () => clearTimeout(timer);
		}
	}, [isOpen, shouldRender, duration]);

	return {
		shouldRender,
		isOpening,
		isClosing,
		isVisible: isOpening && !isClosing,
	};
}
