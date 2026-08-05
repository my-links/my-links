import { fakeBrowser } from 'wxt/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { syncCollections } from '@/lib/sync/sync_collections';
import { fetchCollections, UnauthorizedApiError } from '@/lib/api/collections';
import {
	authInvalidStorage,
	collectionsCacheStorage,
	syncBackoffStorage,
} from '@/lib/storage';

vi.mock('@/lib/api/collections', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/api/collections')>()),
	fetchCollections: vi.fn(),
}));

const mockedFetchCollections = vi.mocked(fetchCollections);

beforeEach(() => {
	fakeBrowser.reset();
	mockedFetchCollections.mockReset();
});

describe('syncCollections', () => {
	it('should cache the fetched collections and reset backoff on success', async () => {
		mockedFetchCollections.mockResolvedValue({
			collections: [],
			followedCollections: [],
		});

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

	it('should flag the token as invalid when the fetch is rejected with 401', async () => {
		mockedFetchCollections.mockRejectedValue(
			new UnauthorizedApiError('token expired')
		);

		await syncCollections();

		expect(await authInvalidStorage.getValue()).toBe(true);
	});

	it('should not flag the token as invalid on a plain network failure', async () => {
		await authInvalidStorage.setValue(true);
		mockedFetchCollections.mockRejectedValue(new Error('network down'));

		await syncCollections();

		expect(await authInvalidStorage.getValue()).toBe(false);
	});

	it('should clear the invalid-token flag once a sync succeeds', async () => {
		await authInvalidStorage.setValue(true);
		mockedFetchCollections.mockResolvedValue({
			collections: [],
			followedCollections: [],
		});

		await syncCollections();

		expect(await authInvalidStorage.getValue()).toBe(false);
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
		let resolveFetch: (
			collections: Awaited<ReturnType<typeof fetchCollections>>
		) => void = () => {};
		mockedFetchCollections.mockImplementation(
			() =>
				new Promise((resolve) => {
					resolveFetch = resolve;
				})
		);

		const firstSync = syncCollections();
		const secondSync = syncCollections();

		await vi.waitFor(() => expect(mockedFetchCollections).toHaveBeenCalled());
		resolveFetch({ collections: [], followedCollections: [] });
		await Promise.all([firstSync, secondSync]);

		expect(mockedFetchCollections).toHaveBeenCalledTimes(1);
	});
});
