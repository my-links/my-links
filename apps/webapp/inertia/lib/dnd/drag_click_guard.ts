/**
 * Whole-card dragging means a real DOM `click` still fires on mouseup after
 * a drag-and-drop, which would otherwise navigate the card's link. A plain
 * module singleton (not React state) is enough here — this is a short-lived
 * timestamp guard, not something any component needs to re-render on.
 */
const SUPPRESS_DURATION_MS = 200;

let suppressUntil = 0;

export function armDragClickGuard(): void {
	suppressUntil = Date.now() + SUPPRESS_DURATION_MS;
}

export function shouldSuppressClick(): boolean {
	return Date.now() < suppressUntil;
}
