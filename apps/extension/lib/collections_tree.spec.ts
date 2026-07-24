import { describe, expect, it } from 'vitest';

import type { CollectionWithLinks, LinkResource } from '@/lib/api/types';
import {
	findLinkByUrl,
	getDefaultCollectionId,
	insertCollectionIntoTree,
	insertLinkIntoTree,
	removeCollectionFromTree,
	removeLinkFromTree,
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
		createdAt: '2026-01-01T00:00:00.000Z',
		updatedAt: '2026-01-01T00:00:00.000Z',
		name: 'Inbox',
		description: null,
		visibility: 'PRIVATE',
		icon: null,
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
	it('should prefer the collection named Inbox', () => {
		const collections = [
			buildCollection({ id: 1, name: 'Reading list' }),
			buildCollection({ id: 2, name: 'Inbox' }),
		];

		expect(getDefaultCollectionId(collections)).toBe(2);
	});

	it('should fall back to the first collection when there is no Inbox', () => {
		const collections = [
			buildCollection({ id: 5, name: 'Reading list' }),
			buildCollection({ id: 6, name: 'Work' }),
		];

		expect(getDefaultCollectionId(collections)).toBe(5);
	});

	it('should return undefined when there are no collections yet', () => {
		expect(getDefaultCollectionId([])).toBeUndefined();
	});
});
