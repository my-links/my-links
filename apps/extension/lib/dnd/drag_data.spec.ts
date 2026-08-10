import { describe, expect, it } from 'vitest';

import {
	isCollectionDragData,
	isInboxDropData,
	isLinkDragData,
	collectionIdForDropTarget,
} from '@/lib/dnd/drag_data';

describe('isCollectionDragData', () => {
	it('should accept a collection drag payload', () => {
		expect(
			isCollectionDragData({
				kind: 'collection',
				collectionId: 1,
				section: 'private',
			})
		).toBe(true);
	});

	it('should reject a link drag payload', () => {
		expect(
			isCollectionDragData({ kind: 'link', linkId: 1, collectionId: 1 })
		).toBe(false);
	});

	it('should reject null, undefined, and non-object values', () => {
		expect(isCollectionDragData(null)).toBe(false);
		expect(isCollectionDragData(undefined)).toBe(false);
		expect(isCollectionDragData('collection')).toBe(false);
		expect(isCollectionDragData(42)).toBe(false);
	});

	it('should reject an object missing kind', () => {
		expect(isCollectionDragData({ collectionId: 1 })).toBe(false);
	});
});

describe('isLinkDragData', () => {
	it('should accept a link drag payload', () => {
		expect(isLinkDragData({ kind: 'link', linkId: 1, collectionId: 1 })).toBe(
			true
		);
	});

	it('should reject a collection drag payload', () => {
		expect(
			isLinkDragData({
				kind: 'collection',
				collectionId: 1,
				section: 'private',
			})
		).toBe(false);
	});

	it('should reject null, undefined, and non-object values', () => {
		expect(isLinkDragData(null)).toBe(false);
		expect(isLinkDragData(undefined)).toBe(false);
		expect(isLinkDragData('link')).toBe(false);
		expect(isLinkDragData(42)).toBe(false);
	});
});

describe('isInboxDropData', () => {
	it('should accept an inbox drop payload', () => {
		expect(isInboxDropData({ kind: 'inbox', collectionId: 1 })).toBe(true);
	});

	it('should reject a collection drag payload', () => {
		expect(
			isInboxDropData({
				kind: 'collection',
				collectionId: 1,
				section: 'private',
			})
		).toBe(false);
	});

	it('should reject a link drag payload', () => {
		expect(isInboxDropData({ kind: 'link', linkId: 1, collectionId: 1 })).toBe(
			false
		);
	});

	it('should reject null, undefined, and non-object values', () => {
		expect(isInboxDropData(null)).toBe(false);
		expect(isInboxDropData(undefined)).toBe(false);
		expect(isInboxDropData('inbox')).toBe(false);
		expect(isInboxDropData(42)).toBe(false);
	});
});

describe('collectionIdForDropTarget', () => {
	it('should read the id off a collection drag payload', () => {
		expect(
			collectionIdForDropTarget({
				kind: 'collection',
				collectionId: 7,
				section: 'private',
			})
		).toBe(7);
	});

	it('should read the id off an inbox drop payload', () => {
		expect(collectionIdForDropTarget({ kind: 'inbox', collectionId: 7 })).toBe(
			7
		);
	});

	it('should read the collection id off a link drag payload', () => {
		expect(
			collectionIdForDropTarget({ kind: 'link', linkId: 1, collectionId: 7 })
		).toBe(7);
	});

	it('should return undefined for anything else', () => {
		expect(collectionIdForDropTarget(null)).toBeUndefined();
		expect(collectionIdForDropTarget({})).toBeUndefined();
	});
});
