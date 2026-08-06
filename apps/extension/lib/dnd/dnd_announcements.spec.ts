import { describe, expect, it } from 'vitest';
import type { Active, Over } from '@dnd-kit/core';

import type { DragData } from '@/lib/dnd/dnd_types';
import { createCollectionsDndAnnouncements } from '@/lib/dnd/dnd_announcements';

function buildActive(data: DragData): Active {
	return {
		id: 'active',
		data: { current: data },
		rect: { current: { initial: null, translated: null } },
	};
}

function buildOver(data: DragData | undefined): Over {
	return {
		id: 'over',
		disabled: false,
		rect: { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 },
		data: { current: data },
	};
}

describe('createCollectionsDndAnnouncements', () => {
	const announcements = createCollectionsDndAnnouncements();

	it('should announce picking up a collection with its section', () => {
		const message = announcements.onDragStart?.({
			active: buildActive({
				kind: 'collection',
				collectionId: 1,
				section: 'private',
			}),
		});
		expect(message).toBe('Picked up collection in My Private Collections.');
	});

	it('should announce picking up a link', () => {
		const message = announcements.onDragStart?.({
			active: buildActive({ kind: 'link', linkId: 1, collectionId: 1 }),
		});
		expect(message).toBe('Picked up link.');
	});

	it('should announce a link filed into another collection on drag end', () => {
		const message = announcements.onDragEnd?.({
			active: buildActive({ kind: 'link', linkId: 1, collectionId: 1 }),
			over: buildOver({
				kind: 'collection',
				collectionId: 2,
				section: 'private',
			}),
		});
		expect(message).toBe('Link filed into another collection.');
	});

	it('should announce a link filed into another collection when dropped on a link row of that collection', () => {
		const message = announcements.onDragEnd?.({
			active: buildActive({ kind: 'link', linkId: 1, collectionId: 1 }),
			over: buildOver({ kind: 'link', linkId: 2, collectionId: 2 }),
		});
		expect(message).toBe('Link filed into another collection.');
	});

	it('should announce a plain link reorder on drag end when over is the same collection', () => {
		const message = announcements.onDragEnd?.({
			active: buildActive({ kind: 'link', linkId: 1, collectionId: 1 }),
			over: buildOver({ kind: 'link', linkId: 2, collectionId: 1 }),
		});
		expect(message).toBe('Link order updated.');
	});

	it('should announce a cancelled reorder when there is no drop target', () => {
		const message = announcements.onDragEnd?.({
			active: buildActive({
				kind: 'collection',
				collectionId: 1,
				section: 'public',
			}),
			over: null,
		});
		expect(message).toBe('Reorder cancelled.');
	});

	it('should announce a cancelled reorder on drag cancel', () => {
		const message = announcements.onDragCancel?.({
			active: buildActive({ kind: 'link', linkId: 1, collectionId: 1 }),
			over: null,
		});
		expect(message).toBe('Reorder cancelled.');
	});
});
