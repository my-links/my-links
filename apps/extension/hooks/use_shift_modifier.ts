import { useEffect, useRef, useState } from 'react';

/**
 * dnd-kit only hands over the modifier state at pointerdown (via
 * `activatorEvent`), which would require pressing Shift before starting the
 * drag — nobody discovers that. This tracks Shift live for the duration of a
 * drag instead. Returns both a reactive value (for UI, e.g. a live badge)
 * and a ref (for a synchronous read inside `onDragEnd`, unaffected by
 * React's render batching).
 */
export function useShiftModifier(isActive: boolean) {
	const [isShiftPressed, setIsShiftPressed] = useState(false);
	const isShiftPressedRef = useRef(false);

	useEffect(() => {
		if (!isActive) {
			isShiftPressedRef.current = false;
			setIsShiftPressed(false);
			return;
		}

		const updateFromEvent = (event: PointerEvent | KeyboardEvent) => {
			isShiftPressedRef.current = event.shiftKey;
			setIsShiftPressed(event.shiftKey);
		};

		window.addEventListener('pointermove', updateFromEvent);
		window.addEventListener('keydown', updateFromEvent);
		window.addEventListener('keyup', updateFromEvent);
		return () => {
			window.removeEventListener('pointermove', updateFromEvent);
			window.removeEventListener('keydown', updateFromEvent);
			window.removeEventListener('keyup', updateFromEvent);
		};
	}, [isActive]);

	return { isShiftPressed, isShiftPressedRef };
}
