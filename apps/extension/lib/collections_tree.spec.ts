import { describe, expect, it } from 'vitest';

import type { CollectionWithLinks, LinkResource } from '@/lib/api/types';
import {
	addLinkToCollectionInTree,
	findLinkByUrl,
	getDefaultCollectionId,
	insertCollectionIntoTree,
	insertLinkIntoTree,
	moveLinkBetweenCollectionsInTree,
	removeCollectionFromTree,
	removeLinkFromTree,
	reorderCollectionsInTree,
	reorderLinksInTree,
	replaceCollectionInTree,
	replaceLinkInTree,
} from '@/lib/collections_tree';

function buildLink(overrides: Partial<LinkResource> = {}): LinkResource {
	return {
		id: 1,
		authorId: 1,
		collectionIds: [1],
		createdAt: '2026-01-01T00:00:00.000Z',
		updatedAt: '2026-01-01T00:00:00.000Z',
		name: 'Example',
		url: 'https://example.com',
		description: null,
		favorite: false,
		clicks: 0,
		lastClickedAt: null,
		...overrides,
	};
}

function buildCollection(
	overrides: Partial<CollectionWithLinks> = {}
): CollectionWithLinks {
	return {
		id: 1,
		authorId: 1,
		isOwner: true,
		isDefault: false,
		createdAt: '2026-01-01T00:00:00.000Z',
		updatedAt: '2026-01-01T00:00:00.000Z',
		name: 'Inbox',
		description: null,
		visibility: 'PRIVATE',
		icon: null,
		position: 0,
		links: [],
		...overrides,
	};
}

describe('insertLinkIntoTree', () => {
	it('should append the link to the collection matching its collectionIds', () => {
		const collections = [
			buildCollection({ id: 1 }),
			buildCollection({ id: 2 }),
		];
		const link = buildLink({ id: 10, collectionIds: [2] });

		const result = insertLinkIntoTree(collections, link);

		expect(result[0].links).toEqual([]);
		expect(result[1].links).toEqual([link]);
	});

	it('should append the link to every collection listed in collectionIds', () => {
		const collections = [
			buildCollection({ id: 1 }),
			buildCollection({ id: 2 }),
			buildCollection({ id: 3 }),
		];
		const link = buildLink({ id: 10, collectionIds: [1, 3] });

		const result = insertLinkIntoTree(collections, link);

		expect(result[0].links).toEqual([link]);
		expect(result[1].links).toEqual([]);
		expect(result[2].links).toEqual([link]);
	});
});

describe('removeLinkFromTree', () => {
	it('should remove the link from whichever collection holds it', () => {
		const link = buildLink({ id: 10 });
		const collections = [buildCollection({ id: 1, links: [link] })];

		const result = removeLinkFromTree(collections, 10);

		expect(result[0].links).toEqual([]);
	});
});

describe('replaceLinkInTree', () => {
	it('should move the link to its new collection when collectionIds changes', () => {
		const link = buildLink({ id: 10, collectionIds: [1] });
		const collections = [
			buildCollection({ id: 1, links: [link] }),
			buildCollection({ id: 2, links: [] }),
		];

		const movedLink = { ...link, collectionIds: [2] };
		const result = replaceLinkInTree(collections, 10, movedLink);

		expect(result[0].links).toEqual([]);
		expect(result[1].links).toEqual([movedLink]);
	});

	it('should fan out the link across every collection in its new set', () => {
		const link = buildLink({ id: 10, collectionIds: [1] });
		const collections = [
			buildCollection({ id: 1, links: [link] }),
			buildCollection({ id: 2, links: [] }),
			buildCollection({ id: 3, links: [] }),
		];

		const movedLink = { ...link, collectionIds: [2, 3] };
		const result = replaceLinkInTree(collections, 10, movedLink);

		expect(result[0].links).toEqual([]);
		expect(result[1].links).toEqual([movedLink]);
		expect(result[2].links).toEqual([movedLink]);
	});

	it('should keep the link at its index when collectionIds is unchanged', () => {
		const before = buildLink({ id: 10, name: 'Before' });
		const target = buildLink({ id: 20, name: 'Target' });
		const after = buildLink({ id: 30, name: 'After' });
		const collections = [
			buildCollection({ id: 1, links: [before, target, after] }),
		];

		const editedTarget = { ...target, name: 'Renamed' };
		const result = replaceLinkInTree(collections, 20, editedTarget);

		expect(result[0].links).toEqual([before, editedTarget, after]);
	});
});

describe('insertCollectionIntoTree', () => {
	it('should append the new collection', () => {
		const collections = [buildCollection({ id: 1 })];

		const result = insertCollectionIntoTree(
			collections,
			buildCollection({ id: 2 })
		);

		expect(result.map((collection) => collection.id)).toEqual([1, 2]);
	});
});

describe('replaceCollectionInTree', () => {
	it('should patch only the matching collection', () => {
		const collections = [
			buildCollection({ id: 1, name: 'Old name' }),
			buildCollection({ id: 2, name: 'Untouched' }),
		];

		const result = replaceCollectionInTree(collections, 1, {
			name: 'New name',
		});

		expect(result[0].name).toBe('New name');
		expect(result[1].name).toBe('Untouched');
	});
});

describe('reorderCollectionsInTree', () => {
	it('should assign the submitted order as positions within the matching visibility', () => {
		const collections = [
			buildCollection({ id: 1, visibility: 'PRIVATE', position: 0 }),
			buildCollection({ id: 2, visibility: 'PRIVATE', position: 1 }),
		];

		const result = reorderCollectionsInTree(collections, 'PRIVATE', [2, 1]);

		expect(result.find((c) => c.id === 2)?.position).toBe(0);
		expect(result.find((c) => c.id === 1)?.position).toBe(1);
	});

	it('should leave collections from the other visibility untouched', () => {
		const collections = [
			buildCollection({ id: 1, visibility: 'PRIVATE', position: 0 }),
			buildCollection({ id: 2, visibility: 'PUBLIC', position: 5 }),
		];

		const result = reorderCollectionsInTree(collections, 'PRIVATE', [1]);

		expect(result.find((c) => c.id === 2)?.position).toBe(5);
	});

	it('should no-op on an id not present in collectionIds', () => {
		const collections = [
			buildCollection({ id: 1, visibility: 'PRIVATE', position: 3 }),
		];

		const result = reorderCollectionsInTree(collections, 'PRIVATE', [999]);

		expect(result[0].position).toBe(3);
	});

	it('should handle a single-collection section', () => {
		const collections = [
			buildCollection({ id: 1, visibility: 'PRIVATE', position: 4 }),
		];

		const result = reorderCollectionsInTree(collections, 'PRIVATE', [1]);

		expect(result[0].position).toBe(0);
	});
});

describe('reorderLinksInTree', () => {
	it('should resequence the matching collection to the submitted id order', () => {
		const first = buildLink({ id: 10, name: 'First' });
		const second = buildLink({ id: 20, name: 'Second' });
		const collections = [buildCollection({ id: 1, links: [first, second] })];

		const result = reorderLinksInTree(collections, 1, [20, 10]);

		expect(result[0].links).toEqual([second, first]);
	});

	it('should leave other collections untouched', () => {
		const link = buildLink({ id: 10 });
		const collections = [
			buildCollection({ id: 1, links: [link] }),
			buildCollection({ id: 2, links: [] }),
		];

		const result = reorderLinksInTree(collections, 1, [10]);

		expect(result[1].links).toEqual([]);
	});
});

describe('moveLinkBetweenCollectionsInTree', () => {
	it('should detach from the source and attach to the target', () => {
		const link = buildLink({ id: 10, collectionIds: [1] });
		const collections = [
			buildCollection({ id: 1, links: [link] }),
			buildCollection({ id: 2, links: [] }),
		];

		const result = moveLinkBetweenCollectionsInTree(collections, 10, 1, 2);

		expect(result[0].links).toEqual([]);
		expect(result[1].links).toEqual([{ ...link, collectionIds: [2] }]);
	});

	it('should no-op when the link is not in the source collection', () => {
		const collections = [
			buildCollection({ id: 1, links: [] }),
			buildCollection({ id: 2, links: [] }),
		];

		const result = moveLinkBetweenCollectionsInTree(collections, 999, 1, 2);

		expect(result).toEqual(collections);
	});
});

describe('addLinkToCollectionInTree', () => {
	it('should attach the link to the target without detaching it from the source', () => {
		const link = buildLink({ id: 10, collectionIds: [1] });
		const collections = [
			buildCollection({ id: 1, links: [link] }),
			buildCollection({ id: 2, links: [] }),
		];

		const result = addLinkToCollectionInTree(collections, 10, 2);

		expect(result[0].links).toEqual([link]);
		expect(result[1].links).toEqual([{ ...link, collectionIds: [1, 2] }]);
	});

	it('should be a no-op when the link is already in the target collection', () => {
		const link = buildLink({ id: 10, collectionIds: [1, 2] });
		const collections = [
			buildCollection({ id: 1, links: [link] }),
			buildCollection({ id: 2, links: [link] }),
		];

		const result = addLinkToCollectionInTree(collections, 10, 2);

		expect(result).toEqual(collections);
	});

	it('should no-op when the link does not exist anywhere in the tree', () => {
		const collections = [buildCollection({ id: 1, links: [] })];

		const result = addLinkToCollectionInTree(collections, 999, 1);

		expect(result).toEqual(collections);
	});
});

describe('removeCollectionFromTree', () => {
	it('should drop the matching collection', () => {
		const collections = [
			buildCollection({ id: 1 }),
			buildCollection({ id: 2 }),
		];

		const result = removeCollectionFromTree(collections, 1);

		expect(result.map((collection) => collection.id)).toEqual([2]);
	});
});

describe('findLinkByUrl', () => {
	it('should find a link nested in any collection', () => {
		const link = buildLink({ id: 10, url: 'https://found.example' });
		const collections = [
			buildCollection({ id: 1, links: [] }),
			buildCollection({ id: 2, links: [link] }),
		];

		expect(findLinkByUrl(collections, 'https://found.example')).toEqual(link);
	});

	it('should return undefined when no link matches', () => {
		const collections = [buildCollection({ id: 1, links: [] })];

		expect(
			findLinkByUrl(collections, 'https://missing.example')
		).toBeUndefined();
	});
});

describe('getDefaultCollectionId', () => {
	it('should return the id of the collection flagged as default', () => {
		const collections = [
			buildCollection({ id: 1, name: 'Work' }),
			buildCollection({ id: 2, name: 'Inbox', isDefault: true }),
		];

		expect(getDefaultCollectionId(collections)).toBe(2);
	});

	it('should return undefined when no collection is the default', () => {
		const collections = [buildCollection({ id: 1, name: 'Work' })];

		expect(getDefaultCollectionId(collections)).toBeUndefined();
	});
});
