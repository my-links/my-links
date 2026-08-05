import { describe, expect, it } from 'vitest';

import { buildReorderOperation } from '@/lib/bookmarks/ordering';
import type { BookmarkNode } from '@/lib/bookmarks/bookmarks_api';

const PARENT_ID = 'parent';

function buildNode(id: string): BookmarkNode {
	return { id, parentId: PARENT_ID, title: id };
}

describe('buildReorderOperation', () => {
	it('should emit one reorder-children operation when the order differs', () => {
		const operations = buildReorderOperation(['b', 'a'], PARENT_ID, [
			buildNode('a'),
			buildNode('b'),
		]);

		expect(operations).toEqual([
			{
				kind: 'reorder-children',
				parentNodeId: PARENT_ID,
				nodeIdsInOrder: ['b', 'a'],
			},
		]);
	});

	it('should emit nothing when the children already match the desired order', () => {
		const operations = buildReorderOperation(['a', 'b'], PARENT_ID, [
			buildNode('a'),
			buildNode('b'),
		]);

		expect(operations).toEqual([]);
	});

	it('should drop desired ids that are not present among the children', () => {
		const operations = buildReorderOperation(['missing', 'b', 'a'], PARENT_ID, [
			buildNode('a'),
			buildNode('b'),
		]);

		expect(operations).toEqual([
			{
				kind: 'reorder-children',
				parentNodeId: PARENT_ID,
				nodeIdsInOrder: ['b', 'a'],
			},
		]);
	});

	it('should leave an actual child not mentioned in the desired order where it sits', () => {
		const operations = buildReorderOperation(['a'], PARENT_ID, [
			buildNode('a'),
			buildNode('unmanaged'),
		]);

		expect(operations).toEqual([]);
	});
});
