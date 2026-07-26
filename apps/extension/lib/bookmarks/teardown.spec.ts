import { describe, expect, it } from 'vitest';

import { planMirrorTeardown } from '@/lib/bookmarks/teardown';
import type { BookmarkMapping } from '@/lib/bookmarks/mapping';
import type { BookmarkNode } from '@/lib/bookmarks/bookmarks_api';

const COLLECTIONS_FOLDER_ID = 'root';

function buildBar(children: BookmarkNode[]): BookmarkNode[] {
	return [{ id: COLLECTIONS_FOLDER_ID, title: 'Collections', children }];
}

function buildMapping(
	folderIdByCollectionId: Record<string, string>,
	bookmarkIdByLinkKey: Record<string, string>
): BookmarkMapping {
	return { folderIdByCollectionId, bookmarkIdByLinkKey };
}

describe('planMirrorTeardown', () => {
	it('should take a collection folder down whole when it holds only mirrored bookmarks', () => {
		const plan = planMirrorTeardown(
			buildMapping({ '1': 'f1' }, { '1:2': 'b2' }),
			COLLECTIONS_FOLDER_ID,
			buildBar([
				{
					id: 'f1',
					title: 'Inbox',
					parentId: COLLECTIONS_FOLDER_ID,
					children: [
						{
							id: 'b2',
							title: 'Google',
							url: 'https://google.com',
							parentId: 'f1',
						},
					],
				},
			])
		);

		expect(plan.operations).toContainEqual({
			kind: 'remove-folder',
			nodeId: 'f1',
			collectionId: 1,
		});
	});

	it('should only forget a bookmark whose folder is being removed whole', () => {
		const plan = planMirrorTeardown(
			buildMapping({ '1': 'f1' }, { '1:2': 'b2' }),
			COLLECTIONS_FOLDER_ID,
			buildBar([
				{
					id: 'f1',
					title: 'Inbox',
					parentId: COLLECTIONS_FOLDER_ID,
					children: [
						{
							id: 'b2',
							title: 'Google',
							url: 'https://google.com',
							parentId: 'f1',
						},
					],
				},
			])
		);

		expect(plan.operations).toContainEqual({
			kind: 'forget-bookmark',
			linkKey: '1:2',
		});
	});

	it('should leave a folder standing when the user filed a bookmark of their own into it', () => {
		const plan = planMirrorTeardown(
			buildMapping({ '1': 'f1' }, { '1:2': 'b2' }),
			COLLECTIONS_FOLDER_ID,
			buildBar([
				{
					id: 'f1',
					title: 'Inbox',
					parentId: COLLECTIONS_FOLDER_ID,
					children: [
						{
							id: 'b2',
							title: 'Google',
							url: 'https://google.com',
							parentId: 'f1',
						},
						{
							id: 'theirs',
							title: 'Mine',
							url: 'https://mine.example.com',
							parentId: 'f1',
						},
					],
				},
			])
		);

		expect(plan.operations).toContainEqual({
			kind: 'forget-folder',
			collectionId: 1,
		});
		expect(plan.operations).toContainEqual({
			kind: 'remove-bookmark',
			nodeId: 'b2',
			linkKey: '1:2',
		});
	});

	it('should remove a pinned favourite from the bar', () => {
		const plan = planMirrorTeardown(
			buildMapping({}, { 'pinned:2': 'p2' }),
			COLLECTIONS_FOLDER_ID,
			[
				{ id: COLLECTIONS_FOLDER_ID, title: 'Collections', children: [] },
				{
					id: 'p2',
					title: 'Google',
					url: 'https://google.com',
					parentId: 'bar',
				},
			]
		);

		expect(plan.operations).toContainEqual({
			kind: 'remove-bookmark',
			nodeId: 'p2',
			linkKey: 'pinned:2',
		});
	});

	it('should forget a mapped node the browser has already reclaimed', () => {
		const plan = planMirrorTeardown(
			buildMapping({ '1': 'gone' }, { '1:2': 'gone-too' }),
			COLLECTIONS_FOLDER_ID,
			buildBar([])
		);

		expect(plan.operations).toEqual([
			{ kind: 'forget-bookmark', linkKey: '1:2' },
			{ kind: 'forget-folder', collectionId: 1 },
		]);
	});

	it('should offer the Collections folder for removal once nothing is left in it', () => {
		const plan = planMirrorTeardown(
			buildMapping({ '1': 'f1' }, {}),
			COLLECTIONS_FOLDER_ID,
			buildBar([
				{
					id: 'f1',
					title: 'Inbox',
					parentId: COLLECTIONS_FOLDER_ID,
					children: [],
				},
			])
		);

		expect(plan.removableCollectionsFolderId).toBe(COLLECTIONS_FOLDER_ID);
	});

	it('should keep the Collections folder when a folder of the user survives in it', () => {
		const plan = planMirrorTeardown(
			buildMapping({ '1': 'f1' }, {}),
			COLLECTIONS_FOLDER_ID,
			buildBar([
				{
					id: 'f1',
					title: 'Inbox',
					parentId: COLLECTIONS_FOLDER_ID,
					children: [],
				},
				{
					id: 'theirs',
					title: 'Recipes',
					parentId: COLLECTIONS_FOLDER_ID,
					children: [],
				},
			])
		);

		expect(plan.removableCollectionsFolderId).toBeUndefined();
	});

	it('should keep the Collections folder when the mirror never recorded one', () => {
		const plan = planMirrorTeardown(buildMapping({}, {}), null, buildBar([]));

		expect(plan.removableCollectionsFolderId).toBeUndefined();
	});
});
