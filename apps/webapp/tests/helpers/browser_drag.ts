import type { Locator, Page } from 'playwright';

// dnd-kit's `PointerSensor` only starts a drag once the pointer has moved
// this many pixels from `mousedown`, mirrors `POINTER_SENSOR_OPTIONS` in
// `dashboard_dnd_provider.tsx`. Playwright's own `dragTo()` doesn't drive the
// sensor reliably, so every drag here is a manual mouse choreography instead.
const DRAG_STEPS = 15;
const DRAG_STEP_DELAY_MS = 20;

export async function dragOnto(
	page: Page,
	source: Locator,
	target: Locator,
	{ shift = false, offsetY = 0 }: { shift?: boolean; offsetY?: number } = {}
): Promise<void> {
	const sourceBox = await source.boundingBox();
	const targetBox = await target.boundingBox();
	if (!sourceBox || !targetBox) {
		throw new Error('Drag source or target has no bounding box');
	}

	const startX = sourceBox.x + sourceBox.width / 2;
	const startY = sourceBox.y + sourceBox.height / 2;
	const endX = targetBox.x + targetBox.width / 2;
	const endY = targetBox.y + targetBox.height / 2 + offsetY;

	await page.mouse.move(startX, startY);
	await page.mouse.down();
	if (shift) {
		await page.keyboard.down('Shift');
	}

	for (let step = 1; step <= DRAG_STEPS; step += 1) {
		const progress = step / DRAG_STEPS;
		await page.mouse.move(
			startX + (endX - startX) * progress,
			startY + (endY - startY) * progress
		);
		await page.waitForTimeout(DRAG_STEP_DELAY_MS);
	}

	await page.mouse.up();
	if (shift) {
		await page.keyboard.up('Shift');
	}
}
