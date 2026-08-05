import { describe, expect, it } from 'vitest';
import type { Active, ClientRect, DroppableContainer } from '@dnd-kit/core';

import type { DragData } from '@/lib/dnd/dnd_types';
import { collectionsDndCollisionDetection } from '@/lib/dnd/collision_detection';

function rect(
	left: number,
	top: number,
	width: number,
	height: number
): ClientRect {
	return {
		left,
		top,
		width,
		height,
		right: left + width,
		bottom: top + height,
	};
}

function buildActive(id: string, data: DragData): Active {
	return {
		id,
		data: { current: data },
		rect: { current: { initial: null, translated: null } },
	};
}

function buildContainer(
	id: string,
	data: DragData | undefined,
	containerRect: ClientRect
): { container: DroppableContainer; rect: ClientRect } {
	return {
		container: {
			id,
			key: id,
			data: { current: data },
			disabled: false,
			node: { current: null },
			rect: { current: containerRect },
		},
		rect: containerRect,
	};
}

function buildArgs({
	active,
	containers,
	collisionRect,
	pointerCoordinates = null,
}: {
	active: Active;
	containers: ReturnType<typeof buildContainer>[];
	collisionRect: ClientRect;
	pointerCoordinates?: { x: number; y: number } | null;
}) {
	return {
		active,
		collisionRect,
		droppableRects: new Map(containers.map((c) => [c.container.id, c.rect])),
		droppableContainers: containers.map((c) => c.container),
		pointerCoordinates,
	};
}

describe('collectionsDndCollisionDetection — dragging a collection', () => {
	it('should only collide with collections from the same section, even when a foreign-section collection is geometrically closer', () => {
		const active = buildActive('private-active', {
			kind: 'collection',
			collectionId: 1,
			section: 'private',
		});
		const privateA = buildContainer(
			'private-a',
			{ kind: 'collection', collectionId: 2, section: 'private' },
			rect(0, 0, 20, 20)
		);
		const privateB = buildContainer(
			'private-b',
			{ kind: 'collection', collectionId: 3, section: 'private' },
			rect(80, 0, 20, 20)
		);
		const publicA = buildContainer(
			'public-a',
			{ kind: 'collection', collectionId: 4, section: 'public' },
			rect(40, 0, 20, 20)
		);

		// Centered right on top of publicA (center 50,10) — the geometrically
		// closest container overall — to prove the section filter, not luck,
		// is what keeps it out of the result.
		const collisions = collectionsDndCollisionDetection(
			buildArgs({
				active,
				containers: [privateA, privateB, publicA],
				collisionRect: rect(45, 0, 20, 20),
			})
		);

		expect(collisions.map((c) => c.id)).not.toContain('public-a');
		expect(collisions[0]?.id).toBe('private-b');
	});
});

describe('collectionsDndCollisionDetection — dragging a link', () => {
	it('should prefer a collection container the pointer is within over any link container', () => {
		const active = buildActive('link-active', {
			kind: 'link',
			linkId: 1,
			collectionId: 1,
		});
		const collectionX = buildContainer(
			'collection-x',
			{ kind: 'collection', collectionId: 2, section: 'private' },
			rect(0, 0, 100, 100)
		);
		const linkY = buildContainer(
			'link-y',
			{ kind: 'link', linkId: 2, collectionId: 1 },
			rect(10, 10, 20, 20)
		);

		const collisions = collectionsDndCollisionDetection(
			buildArgs({
				active,
				containers: [collectionX, linkY],
				collisionRect: rect(45, 45, 10, 10),
				pointerCoordinates: { x: 50, y: 50 },
			})
		);

		expect(collisions.map((c) => c.id)).toContain('collection-x');
		expect(collisions.map((c) => c.id)).not.toContain('link-y');
	});

	it('should fall back to the closest link container when the pointer is over no collection', () => {
		const active = buildActive('link-active', {
			kind: 'link',
			linkId: 1,
			collectionId: 1,
		});
		const collectionX = buildContainer(
			'collection-x',
			{ kind: 'collection', collectionId: 2, section: 'private' },
			rect(200, 200, 100, 100)
		);
		const linkY = buildContainer(
			'link-y',
			{ kind: 'link', linkId: 2, collectionId: 1 },
			rect(0, 0, 20, 20)
		);
		const linkZ = buildContainer(
			'link-z',
			{ kind: 'link', linkId: 3, collectionId: 1 },
			rect(40, 0, 20, 20)
		);

		const collisions = collectionsDndCollisionDetection(
			buildArgs({
				active,
				containers: [collectionX, linkY, linkZ],
				collisionRect: rect(45, 0, 20, 20),
				pointerCoordinates: { x: 5, y: 5 },
			})
		);

		expect(collisions.map((c) => c.id)).not.toContain('collection-x');
		expect(collisions[0]?.id).toBe('link-z');
	});
});

describe('collectionsDndCollisionDetection — followed collections never registered', () => {
	it('should ignore a container with no drag data, as a non-draggable followed-collection row would leave behind', () => {
		const active = buildActive('link-active', {
			kind: 'link',
			linkId: 1,
			collectionId: 1,
		});
		const followedRow = buildContainer(
			'followed-row',
			undefined,
			rect(0, 0, 100, 100)
		);
		const linkY = buildContainer(
			'link-y',
			{ kind: 'link', linkId: 2, collectionId: 1 },
			rect(0, 0, 20, 20)
		);

		const collisions = collectionsDndCollisionDetection(
			buildArgs({
				active,
				containers: [followedRow, linkY],
				collisionRect: rect(5, 5, 10, 10),
				pointerCoordinates: { x: 10, y: 10 },
			})
		);

		expect(collisions.map((c) => c.id)).not.toContain('followed-row');
	});
});
