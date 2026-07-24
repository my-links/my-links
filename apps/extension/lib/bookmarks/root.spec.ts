import { describe, expect, it } from 'vitest';

import { BOOKMARK_ROOT_TITLE } from '@/lib/bookmarks/constants';
import { FakeBookmarksApi } from '@/lib/bookmarks/fake_bookmarks_api';
import {
	buildBackupFolderTitle,
	selectNodesToBackUp,
} from '@/lib/bookmarks/backup';
import {
	getOrCreateMyLinksRoot,
	resolveBookmarksBarId,
	takeOverBookmarksBar,
} from '@/lib/bookmarks/root';

const TAKEN_OVER_AT = new Date('2026-07-24T18:30:00.000Z');

function buildBrowserWithBar() {
	const api = new FakeBookmarksApi();
	const barId = api.createFolder(api.rootId, 'Bookmarks bar');
	api.createFolder(api.rootId, 'Other bookmarks');
	return { api, barId };
}

async function titlesUnder(api: FakeBookmarksApi, id: string) {
	const [node] = await api.getSubTree(id);
	return (node?.children ?? []).map((child) => child.title);
}

describe('buildBackupFolderTitle', () => {
	it('should date the backup folder so a second takeover keeps its own snapshot', () => {
		expect(buildBackupFolderTitle(TAKEN_OVER_AT)).toBe('Backup 2026-07-24');
	});
});

describe('selectNodesToBackUp', () => {
	it('should leave the MyLinks root out so the mirror is never nested inside its own backup', () => {
		const barChildren = [
			{ id: '10', title: 'Recipes' },
			{ id: '11', title: BOOKMARK_ROOT_TITLE },
		];

		expect(selectNodesToBackUp(barChildren, '11')).toEqual([
			{ id: '10', title: 'Recipes' },
		]);
	});
});

describe('resolveBookmarksBarId', () => {
	it('should pick the browser bookmarks bar by its well-known id', async () => {
		const { api, barId } = buildBrowserWithBar();

		expect(await resolveBookmarksBarId(api)).toBe(barId);
	});
});

describe('getOrCreateMyLinksRoot', () => {
	it('should create the root folder on the bookmarks bar when there is none', async () => {
		const { api, barId } = buildBrowserWithBar();

		const rootId = await getOrCreateMyLinksRoot(api, null);

		expect(await titlesUnder(api, barId)).toEqual([BOOKMARK_ROOT_TITLE]);
		const [root] = await api.getSubTree(rootId);
		expect(root?.parentId).toBe(barId);
	});

	it('should adopt an existing MyLinks folder instead of creating a second one', async () => {
		const { api, barId } = buildBrowserWithBar();
		const existingRootId = api.createFolder(barId, BOOKMARK_ROOT_TITLE);

		expect(await getOrCreateMyLinksRoot(api, null)).toBe(existingRootId);
		expect(await titlesUnder(api, barId)).toEqual([BOOKMARK_ROOT_TITLE]);
	});

	it('should recreate the root when the folder recorded last time was deleted by hand', async () => {
		const { api, barId } = buildBrowserWithBar();
		const staleRootId = api.createFolder(barId, BOOKMARK_ROOT_TITLE);
		await api.removeTree(staleRootId);

		const rootId = await getOrCreateMyLinksRoot(api, staleRootId);

		expect(rootId).not.toBe(staleRootId);
		expect(await titlesUnder(api, barId)).toEqual([BOOKMARK_ROOT_TITLE]);
	});
});

describe('takeOverBookmarksBar', () => {
	it('should move everything already on the bar into a dated backup folder', async () => {
		const { api, barId } = buildBrowserWithBar();
		api.createFolder(barId, 'Recipes');
		api.createLink(barId, 'News', 'https://news.example.com');
		const rootId = await getOrCreateMyLinksRoot(api, null);

		const backupFolderId = await takeOverBookmarksBar(
			api,
			rootId,
			TAKEN_OVER_AT
		);

		expect(await titlesUnder(api, barId)).toEqual([BOOKMARK_ROOT_TITLE]);
		expect(await titlesUnder(api, rootId)).toEqual(['Backup 2026-07-24']);
		expect(await titlesUnder(api, backupFolderId ?? '')).toEqual([
			'Recipes',
			'News',
		]);
	});

	it('should keep the backed up bookmarks intact rather than deleting them', async () => {
		const { api, barId } = buildBrowserWithBar();
		const recipesId = api.createFolder(barId, 'Recipes');
		api.createLink(recipesId, 'Bread', 'https://bread.example.com');
		const rootId = await getOrCreateMyLinksRoot(api, null);

		await takeOverBookmarksBar(api, rootId, TAKEN_OVER_AT);

		expect(await titlesUnder(api, recipesId)).toEqual(['Bread']);
	});

	it('should create no backup folder when the bar holds nothing but the root', async () => {
		const { api } = buildBrowserWithBar();
		const rootId = await getOrCreateMyLinksRoot(api, null);

		expect(
			await takeOverBookmarksBar(api, rootId, TAKEN_OVER_AT)
		).toBeUndefined();
		expect(await titlesUnder(api, rootId)).toEqual([]);
	});
});
