import { fakeBrowser } from 'wxt/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createLink } from '@/lib/api/links';
import { collectionsCacheStorage } from '@/lib/storage';
import { syncCollections } from '@/lib/sync/sync_collections';
import {
	handleContextMenuClick,
	resolveQuickCapture,
} from '@/lib/context_menu';

vi.mock('@/lib/api/links', () => ({
	createLink: vi.fn(),
}));
vi.mock('@/lib/sync/sync_collections', () => ({
	syncCollections: vi.fn(),
}));

const mockedCreateLink = vi.mocked(createLink);
const mockedSyncCollections = vi.mocked(syncCollections);

beforeEach(() => {
	fakeBrowser.reset();
	mockedCreateLink.mockReset();
	mockedSyncCollections.mockReset();
});

describe('resolveQuickCapture', () => {
	it('should capture the linked URL for the "link" context', () => {
		const capture = resolveQuickCapture(
			{
				menuItemId: 'mylinks-add-link',
				editable: false,
				linkUrl: 'https://example.com/target',
			},
			undefined
		);

		expect(capture).toEqual({
			name: 'https://example.com/target',
			url: 'https://example.com/target',
		});
	});

	it('should capture the page URL with the selection as description', () => {
		const capture = resolveQuickCapture(
			{
				menuItemId: 'mylinks-add-selection',
				editable: false,
				selectionText: 'quoted text',
			},
			{
				url: 'https://example.com/page',
				title: 'Example page',
			} as Browser.tabs.Tab
		);

		expect(capture).toEqual({
			name: 'Example page',
			url: 'https://example.com/page',
			description: 'quoted text',
		});
	});

	it('should capture the current page for the "page" context', () => {
		const capture = resolveQuickCapture(
			{ menuItemId: 'mylinks-add-page', editable: false },
			{
				url: 'https://example.com/page',
				title: 'Example page',
			} as Browser.tabs.Tab
		);

		expect(capture).toEqual({
			name: 'Example page',
			url: 'https://example.com/page',
		});
	});

	it('should return null when the click carries no usable url', () => {
		const capture = resolveQuickCapture(
			{ menuItemId: 'mylinks-add-link', editable: false },
			undefined
		);

		expect(capture).toBeNull();
	});
});

describe('handleContextMenuClick', () => {
	const pageClickInfo = { menuItemId: 'mylinks-add-page', editable: false };
	const tab = {
		url: 'https://example.com/page',
		title: 'Example page',
	} as Browser.tabs.Tab;

	it('should create the link and resync when the URL is new', async () => {
		mockedCreateLink.mockResolvedValue(undefined);

		await handleContextMenuClick(pageClickInfo, tab);

		expect(mockedCreateLink).toHaveBeenCalledWith({
			name: 'Example page',
			url: 'https://example.com/page',
			favorite: false,
		});
		expect(mockedSyncCollections).toHaveBeenCalled();
	});

	it('should skip creation and not resync when the URL is already saved', async () => {
		await collectionsCacheStorage.setValue({
			fetchedAt: Date.now(),
			collections: [
				{
					id: 1,
					authorId: 1,
					isOwner: true,
					createdAt: '2026-01-01T00:00:00.000Z',
					updatedAt: '2026-01-01T00:00:00.000Z',
					name: 'Inbox',
					description: null,
					visibility: 'PRIVATE',
					icon: null,
					links: [
						{
							id: 1,
							authorId: 1,
							collectionIds: [1],
							createdAt: '2026-01-01T00:00:00.000Z',
							updatedAt: '2026-01-01T00:00:00.000Z',
							name: 'Example page',
							url: 'https://example.com/page',
							description: null,
							favorite: false,
						},
					],
				},
			],
		});

		await handleContextMenuClick(pageClickInfo, tab);

		expect(mockedCreateLink).not.toHaveBeenCalled();
		expect(mockedSyncCollections).not.toHaveBeenCalled();
	});

	it('should do nothing when the click carries no usable url', async () => {
		await handleContextMenuClick(
			{ menuItemId: 'mylinks-add-link', editable: false },
			undefined
		);

		expect(mockedCreateLink).not.toHaveBeenCalled();
	});
});
