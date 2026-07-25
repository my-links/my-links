import { fakeBrowser } from 'wxt/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SEARCH_FOCUS_REQUEST_TTL_MS } from '@/lib/search/constants';
import {
	consumeSearchFocusRequest,
	isSearchFocusRequestFresh,
	requestSearchFocus,
	searchFocusRequestStorage,
} from '@/lib/search/focus_request';

beforeEach(() => {
	fakeBrowser.reset();
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
});

describe('isSearchFocusRequestFresh', () => {
	it('should reject the absence of a request', () => {
		expect(isSearchFocusRequestFresh(null)).toBe(false);
	});

	it('should accept a request made within the time to live', () => {
		const requestedAt = Date.now();

		vi.advanceTimersByTime(SEARCH_FOCUS_REQUEST_TTL_MS - 1);

		expect(isSearchFocusRequestFresh(requestedAt)).toBe(true);
	});

	it('should reject a request older than the time to live', () => {
		const requestedAt = Date.now();

		vi.advanceTimersByTime(SEARCH_FOCUS_REQUEST_TTL_MS);

		expect(isSearchFocusRequestFresh(requestedAt)).toBe(false);
	});
});

describe('consumeSearchFocusRequest', () => {
	it('should report a pending request', async () => {
		await requestSearchFocus();

		await expect(consumeSearchFocusRequest()).resolves.toBe(true);
	});

	it('should clear the request so a later page does not steal focus', async () => {
		await requestSearchFocus();
		await consumeSearchFocusRequest();

		await expect(consumeSearchFocusRequest()).resolves.toBe(false);
	});

	it('should report no request when none was ever made', async () => {
		await expect(consumeSearchFocusRequest()).resolves.toBe(false);
	});

	it('should ignore a request left over from an earlier keystroke', async () => {
		await requestSearchFocus();

		vi.advanceTimersByTime(SEARCH_FOCUS_REQUEST_TTL_MS);

		await expect(consumeSearchFocusRequest()).resolves.toBe(false);
	});

	it('should leave nothing stored behind', async () => {
		await requestSearchFocus();
		await consumeSearchFocusRequest();

		await expect(searchFocusRequestStorage.getValue()).resolves.toBeNull();
	});
});
