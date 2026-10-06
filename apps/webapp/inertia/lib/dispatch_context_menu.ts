export const dispatchContextMenuAt = (
	target: HTMLDivElement | null,
	x: number,
	y: number
) => {
	target?.dispatchEvent(
		new MouseEvent('contextmenu', {
			bubbles: true,
			cancelable: true,
			clientX: x,
			clientY: y,
		})
	);
};
