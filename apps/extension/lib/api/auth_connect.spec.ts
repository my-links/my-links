import { fakeBrowser } from 'wxt/testing/fake-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { connectToInstance } from '@/lib/api/auth';
import { EMPTY_BOOKMARK_MAPPING } from '@/lib/bookmarks/mapping';
import { fetchAccountIdentity } from '@/lib/api/account_identity';
import {
	accountIdentityStorage,
	apiTokenStorage,
	bookmarkMappingStorage,
	collectionsCacheStorage,
} from '@/lib/storage';

vi.mock('@/lib/api/account_identity', () => ({
	fetchAccountIdentity: vi.fn(),
}));

const mockedFetchAccountIdentity = vi.mocked(fetchAccountIdentity);

const INSTANCE_URL = 'https://mylinks.example.com';
const CACHED_FETCH_TIME = 123;
const MAPPED_BOOKMARK_MAPPING = {
	folderIdByCollectionId: { '1': 'folder-1' },
	bookmarkIdByLinkKey: { '1:1': 'bookmark-1' },
};

async function seedPreviousAccountData(identity: string | null) {
	await accountIdentityStorage.setValue(identity);
	await collectionsCacheStorage.setValue({
		collections: [],
		followedCollections: [],
		fetchedAt: CACHED_FETCH_TIME,
	});
	await bookmarkMappingStorage.setValue(MAPPED_BOOKMARK_MAPPING);
}

beforeEach(() => {
	fakeBrowser.reset();
	mockedFetchAccountIdentity.mockReset();
	vi.stubGlobal('fetch', vi.fn().mockResolvedValue({}));
	Object.assign(browser.permissions, {
		request: vi.fn().mockResolvedValue(true),
	});
	Object.assign(browser.identity, {
		getRedirectURL: vi
			.fn()
			.mockReturnValue('https://extension.chromiumapp.org/'),
		launchWebAuthFlow: vi
			.fn()
			.mockResolvedValue('https://extension.chromiumapp.org/#token=new-token'),
	});
});

describe('connectToInstance account switch', () => {
	it('should keep cached data when reconnecting as the same account', async () => {
		mockedFetchAccountIdentity.mockResolvedValue(`${INSTANCE_URL}#7`);
		await seedPreviousAccountData(`${INSTANCE_URL}#7`);

		await connectToInstance(INSTANCE_URL);

		expect((await collectionsCacheStorage.getValue()).fetchedAt).toBe(
			CACHED_FETCH_TIME
		);
		expect(await bookmarkMappingStorage.getValue()).toEqual(
			MAPPED_BOOKMARK_MAPPING
		);
	});

	it('should drop cached data and mapping when reconnecting as another account', async () => {
		mockedFetchAccountIdentity.mockResolvedValue(`${INSTANCE_URL}#8`);
		await seedPreviousAccountData(`${INSTANCE_URL}#7`);

		await connectToInstance(INSTANCE_URL);

		expect((await collectionsCacheStorage.getValue()).fetchedAt).toBe(0);
		expect(await bookmarkMappingStorage.getValue()).toEqual(
			EMPTY_BOOKMARK_MAPPING
		);
	});

	it('should drop cached data when no identity was stored before', async () => {
		mockedFetchAccountIdentity.mockResolvedValue(`${INSTANCE_URL}#7`);
		await seedPreviousAccountData(null);

		await connectToInstance(INSTANCE_URL);

		expect((await collectionsCacheStorage.getValue()).fetchedAt).toBe(0);
	});

	it('should store the new identity and token after connecting', async () => {
		mockedFetchAccountIdentity.mockResolvedValue(`${INSTANCE_URL}#8`);

		await connectToInstance(INSTANCE_URL);

		expect(await accountIdentityStorage.getValue()).toBe(`${INSTANCE_URL}#8`);
		expect(await apiTokenStorage.getValue()).toBe('new-token');
	});
});
