import { describe, expect, it } from 'vitest';

import { isCollectionDragData, isLinkDragData } from '@/lib/dnd/drag_data';

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
