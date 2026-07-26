import { describe, expect, it } from 'vitest';

import { COLLECTIONS_FOLDER_TITLE } from '@/lib/bookmarks/constants';
import { FakeBookmarksApi } from '@/lib/bookmarks/fake_bookmarks_api';
import {
	getOrCreateCollectionsFolder,
	resolveBookmarksBarId,
} from '@/lib/bookmarks/root';

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

describe('resolveBookmarksBarId', () => {
	it('should pick the browser bookmarks bar by its well-known id', async () => {
		const { api, barId } = buildBrowserWithBar();

		expect(await resolveBookmarksBarId(api)).toBe(barId);
	});
});

describe('getOrCreateCollectionsFolder', () => {
	it('should create the folder first on the bookmarks bar', async () => {
		const { api, barId } = buildBrowserWithBar();
		api.createFolder(barId, 'Recipes');

		const { id: folderId } = await getOrCreateCollectionsFolder(api, null);

		expect(await titlesUnder(api, barId)).toEqual([
			COLLECTIONS_FOLDER_TITLE,
			'Recipes',
		]);
		const [folder] = await api.getSubTree(folderId);
		expect(folder?.parentId).toBe(barId);
	});

	it('should leave the bookmarks already on the bar in place', async () => {
		const { api, barId } = buildBrowserWithBar();
		api.createLink(barId, 'News', 'https://news.example.com');
		const recipesId = api.createFolder(barId, 'Recipes');
		api.createLink(recipesId, 'Bread', 'https://bread.example.com');

		await getOrCreateCollectionsFolder(api, null);

		expect(await titlesUnder(api, barId)).toEqual([
			COLLECTIONS_FOLDER_TITLE,
			'News',
			'Recipes',
		]);
		expect(await titlesUnder(api, recipesId)).toEqual(['Bread']);
	});

	it('should adopt an existing Collections folder instead of creating a second one', async () => {
		const { api, barId } = buildBrowserWithBar();
		const existingFolderId = api.createFolder(barId, COLLECTIONS_FOLDER_TITLE);

		expect((await getOrCreateCollectionsFolder(api, null)).id).toBe(
			existingFolderId
		);
		expect(await titlesUnder(api, barId)).toEqual([COLLECTIONS_FOLDER_TITLE]);
	});

	it('should retitle and move back the folder it tracked under an older name', async () => {
		const { api, barId } = buildBrowserWithBar();
		api.createLink(barId, 'News', 'https://news.example.com');
		const legacyFolderId = api.createFolder(barId, 'MyLinks');

		expect((await getOrCreateCollectionsFolder(api, legacyFolderId)).id).toBe(
			legacyFolderId
		);
		expect(await titlesUnder(api, barId)).toEqual([
			COLLECTIONS_FOLDER_TITLE,
			'News',
		]);
	});

	it('should recreate the folder when the one recorded last time was deleted by hand', async () => {
		const { api, barId } = buildBrowserWithBar();
		const staleFolderId = api.createFolder(barId, COLLECTIONS_FOLDER_TITLE);
		await api.removeTree(staleFolderId);

		const { id: folderId } = await getOrCreateCollectionsFolder(
			api,
			staleFolderId
		);

		expect(folderId).not.toBe(staleFolderId);
		expect(await titlesUnder(api, barId)).toEqual([COLLECTIONS_FOLDER_TITLE]);
	});

	it('should report a folder it had to create as created', async () => {
		const { api } = buildBrowserWithBar();

		const { origin } = await getOrCreateCollectionsFolder(api, null);

		expect(origin).toBe('created');
	});

	it('should report a folder left behind by an earlier install as adopted', async () => {
		const { api, barId } = buildBrowserWithBar();
		api.createFolder(barId, COLLECTIONS_FOLDER_TITLE);

		const { origin } = await getOrCreateCollectionsFolder(api, null);

		expect(origin).toBe('adopted');
	});
});
