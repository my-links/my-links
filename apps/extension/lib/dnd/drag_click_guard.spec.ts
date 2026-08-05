import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	armDragClickGuard,
	shouldSuppressClick,
} from '@/lib/dnd/drag_click_guard';

describe('drag click guard', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	// Order matters: `suppressUntil` is deliberately a module-level singleton,
	// not something exposed for a test to reset — this case must run before
	// any other test arms the guard.
	it('should not suppress a click when never armed', () => {
		expect(shouldSuppressClick()).toBe(false);
	});

	it('should suppress a click immediately after being armed', () => {
		armDragClickGuard();
		expect(shouldSuppressClick()).toBe(true);
	});

	it('should stop suppressing once the guard window elapses', () => {
		armDragClickGuard();
		vi.advanceTimersByTime(201);
		expect(shouldSuppressClick()).toBe(false);
	});
});
