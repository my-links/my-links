import { fakeBrowser } from 'wxt/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchCollections } from '@/lib/api/collections';
import { syncCollections } from '@/lib/sync/sync_collections';
import { collectionsCacheStorage, syncBackoffStorage } from '@/lib/storage';

vi.mock('@/lib/api/collections', () => ({
	fetchCollections: vi.fn(),
}));

const mockedFetchCollections = vi.mocked(fetchCollections);

beforeEach(() => {
	fakeBrowser.reset();
	mockedFetchCollections.mockReset();
});

describe('syncCollections', () => {
	it('should cache the fetched collections and reset backoff on success', async () => {
		mockedFetchCollections.mockResolvedValue([]);

		await syncCollections();

		const cache = await collectionsCacheStorage.getValue();
		expect(cache.collections).toEqual([]);
		const backoffState = await syncBackoffStorage.getValue();
		expect(backoffState.consecutiveFailures).toBe(0);
	});

	it('should record backoff without touching the cache when the fetch fails', async () => {
		mockedFetchCollections.mockRejectedValue(new Error('network down'));

		await syncCollections();

		const backoffState = await syncBackoffStorage.getValue();
		expect(backoffState.consecutiveFailures).toBe(1);
		expect(backoffState.nextAttemptAt).toBeGreaterThan(Date.now());
	});

	it('should skip fetching while backing off', async () => {
		await syncBackoffStorage.setValue({
			consecutiveFailures: 3,
			nextAttemptAt: Date.now() + 60_000,
		});

		await syncCollections();

		expect(mockedFetchCollections).not.toHaveBeenCalled();
	});

	it('should not run two syncs concurrently', async () => {
		let resolveFetch: (collections: []) => void = () => {};
		mockedFetchCollections.mockImplementation(
			() =>
				new Promise((resolve) => {
					resolveFetch = resolve;
				})
		);

		const firstSync = syncCollections();
		const secondSync = syncCollections();

		await vi.waitFor(() => expect(mockedFetchCollections).toHaveBeenCalled());
		resolveFetch([]);
		await Promise.all([firstSync, secondSync]);

		expect(mockedFetchCollections).toHaveBeenCalledTimes(1);
	});
});
