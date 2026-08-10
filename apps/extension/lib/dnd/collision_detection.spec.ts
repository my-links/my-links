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
			isOwner: true,
		});
		const privateA = buildContainer(
			'private-a',
			{
				kind: 'collection',
				collectionId: 2,
				section: 'private',
				isOwner: true,
			},
			rect(0, 0, 20, 20)
		);
		const privateB = buildContainer(
			'private-b',
			{
				kind: 'collection',
				collectionId: 3,
				section: 'private',
				isOwner: true,
			},
			rect(80, 0, 20, 20)
		);
		const publicA = buildContainer(
			'public-a',
			{ kind: 'collection', collectionId: 4, section: 'public', isOwner: true },
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

	it('should target the collection under the pointer rather than the one whose center is closest', () => {
		const active = buildActive('private-active', {
			kind: 'collection',
			collectionId: 1,
			section: 'private',
			isOwner: true,
		});
		// Expanded: its rect covers its own link rows, pushing its center far up.
		const expanded = buildContainer(
			'expanded',
			{
				kind: 'collection',
				collectionId: 2,
				section: 'private',
				isOwner: true,
			},
			rect(0, 0, 100, 300)
		);
		const collapsed = buildContainer(
			'collapsed',
			{
				kind: 'collection',
				collectionId: 3,
				section: 'private',
				isOwner: true,
			},
			rect(0, 300, 100, 30)
		);

		const collisions = collectionsDndCollisionDetection(
			buildArgs({
				active,
				containers: [expanded, collapsed],
				collisionRect: rect(0, 250, 100, 30),
				pointerCoordinates: { x: 50, y: 260 },
			})
		);

		expect(collisions[0]?.id).toBe('expanded');
	});

	it('should fall back to center distance for keyboard drags, which carry no pointer', () => {
		const active = buildActive('private-active', {
			kind: 'collection',
			collectionId: 1,
			section: 'private',
			isOwner: true,
		});
		const near = buildContainer(
			'near',
			{
				kind: 'collection',
				collectionId: 2,
				section: 'private',
				isOwner: true,
			},
			rect(0, 0, 100, 20)
		);
		const far = buildContainer(
			'far',
			{
				kind: 'collection',
				collectionId: 3,
				section: 'private',
				isOwner: true,
			},
			rect(0, 200, 100, 20)
		);

		const collisions = collectionsDndCollisionDetection(
			buildArgs({
				active,
				containers: [near, far],
				collisionRect: rect(0, 10, 100, 20),
				pointerCoordinates: null,
			})
		);

		expect(collisions[0]?.id).toBe('near');
	});
});

describe('collectionsDndCollisionDetection — dragging a link', () => {
	// A collection's droppable node wraps its own link rows, so every hover
	// over a sibling row is geometrically inside the parent collection too.
	it('should target the link row under the pointer over the collection containing it', () => {
		const active = buildActive('link-active', {
			kind: 'link',
			linkId: 1,
			collectionId: 1,
		});
		const collectionX = buildContainer(
			'collection-x',
			{
				kind: 'collection',
				collectionId: 1,
				section: 'private',
				isOwner: true,
			},
			rect(0, 0, 100, 100)
		);
		const linkY = buildContainer(
			'link-y',
			{ kind: 'link', linkId: 2, collectionId: 1 },
			rect(0, 40, 100, 20)
		);

		const collisions = collectionsDndCollisionDetection(
			buildArgs({
				active,
				containers: [collectionX, linkY],
				collisionRect: rect(0, 45, 100, 20),
				pointerCoordinates: { x: 50, y: 50 },
			})
		);

		expect(collisions[0]?.id).toBe('link-y');
		expect(collisions.map((c) => c.id)).not.toContain('collection-x');
	});

	it('should target the collection when the pointer is inside it but on none of its link rows', () => {
		const active = buildActive('link-active', {
			kind: 'link',
			linkId: 1,
			collectionId: 1,
		});
		const collectionX = buildContainer(
			'collection-x',
			{
				kind: 'collection',
				collectionId: 2,
				section: 'private',
				isOwner: true,
			},
			rect(0, 0, 100, 100)
		);
		const linkY = buildContainer(
			'link-y',
			{ kind: 'link', linkId: 2, collectionId: 2 },
			rect(0, 80, 100, 20)
		);

		const collisions = collectionsDndCollisionDetection(
			buildArgs({
				active,
				containers: [collectionX, linkY],
				collisionRect: rect(0, 5, 100, 20),
				pointerCoordinates: { x: 50, y: 10 },
			})
		);

		expect(collisions.map((c) => c.id)).toContain('collection-x');
		expect(collisions.map((c) => c.id)).not.toContain('link-y');
	});

	it('should never fall back to a link from another collection when the pointer is outside every container', () => {
		const active = buildActive('link-active', {
			kind: 'link',
			linkId: 1,
			collectionId: 1,
		});
		const siblingLink = buildContainer(
			'sibling-link',
			{ kind: 'link', linkId: 2, collectionId: 1 },
			rect(0, 0, 20, 20)
		);
		const foreignLink = buildContainer(
			'foreign-link',
			{ kind: 'link', linkId: 3, collectionId: 2 },
			rect(0, 40, 20, 20)
		);

		// Closer to the foreign link, which a drift past the collection's own
		// bounds must not turn into an unasked-for move.
		const collisions = collectionsDndCollisionDetection(
			buildArgs({
				active,
				containers: [siblingLink, foreignLink],
				collisionRect: rect(0, 35, 20, 20),
				pointerCoordinates: { x: 200, y: 200 },
			})
		);

		expect(collisions.map((c) => c.id)).not.toContain('foreign-link');
		expect(collisions[0]?.id).toBe('sibling-link');
	});

	it('should fall back to the closest link container when the pointer is over no container at all', () => {
		const active = buildActive('link-active', {
			kind: 'link',
			linkId: 1,
			collectionId: 1,
		});
		const collectionX = buildContainer(
			'collection-x',
			{
				kind: 'collection',
				collectionId: 2,
				section: 'private',
				isOwner: true,
			},
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
				pointerCoordinates: { x: 500, y: 500 },
			})
		);

		expect(collisions.map((c) => c.id)).not.toContain('collection-x');
		expect(collisions[0]?.id).toBe('link-z');
	});
});

describe('collectionsDndCollisionDetection — malformed containers', () => {
	it('should ignore a container with no drag data at all', () => {
		const active = buildActive('link-active', {
			kind: 'link',
			linkId: 1,
			collectionId: 1,
		});
		const emptyRow = buildContainer(
			'empty-row',
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
				containers: [emptyRow, linkY],
				collisionRect: rect(5, 5, 10, 10),
				pointerCoordinates: { x: 10, y: 10 },
			})
		);

		expect(collisions.map((c) => c.id)).not.toContain('empty-row');
	});
});

describe('collectionsDndCollisionDetection — the pinned Inbox', () => {
	it('should accept a dropped link', () => {
		const active = buildActive('link-active', {
			kind: 'link',
			linkId: 1,
			collectionId: 1,
		});
		const inbox = buildContainer(
			'inbox',
			{ kind: 'inbox', collectionId: 4 },
			rect(0, 0, 100, 100)
		);

		const collisions = collectionsDndCollisionDetection(
			buildArgs({
				active,
				containers: [inbox],
				collisionRect: rect(5, 5, 10, 10),
				pointerCoordinates: { x: 10, y: 10 },
			})
		);

		expect(collisions.map((c) => c.id)).toContain('inbox');
	});

	it('should never be a candidate while a collection is being reordered', () => {
		const active = buildActive('private-active', {
			kind: 'collection',
			collectionId: 1,
			section: 'private',
			isOwner: true,
		});
		const inbox = buildContainer(
			'inbox',
			{ kind: 'inbox', collectionId: 4 },
			rect(0, 0, 100, 100)
		);
		const privateA = buildContainer(
			'private-a',
			{
				kind: 'collection',
				collectionId: 2,
				section: 'private',
				isOwner: true,
			},
			rect(200, 200, 20, 20)
		);

		const collisions = collectionsDndCollisionDetection(
			buildArgs({
				active,
				containers: [inbox, privateA],
				collisionRect: rect(5, 5, 10, 10),
				pointerCoordinates: { x: 10, y: 10 },
			})
		);

		expect(collisions.map((c) => c.id)).not.toContain('inbox');
	});
});

describe('collectionsDndCollisionDetection — dragging a link over a followed collection', () => {
	it('should never target a followed (non-owned) collection as a drop target', () => {
		const active = buildActive('link-active', {
			kind: 'link',
			linkId: 1,
			collectionId: 1,
		});
		const followedCollection = buildContainer(
			'followed-collection',
			{
				kind: 'collection',
				collectionId: 2,
				section: 'followed',
				isOwner: false,
			},
			rect(0, 0, 100, 100)
		);
		const ownedCollection = buildContainer(
			'owned-collection',
			{
				kind: 'collection',
				collectionId: 3,
				section: 'private',
				isOwner: true,
			},
			rect(200, 200, 100, 100)
		);

		const collisions = collectionsDndCollisionDetection(
			buildArgs({
				active,
				containers: [followedCollection, ownedCollection],
				collisionRect: rect(5, 5, 10, 10),
				pointerCoordinates: { x: 10, y: 10 },
			})
		);

		expect(collisions.map((c) => c.id)).not.toContain('followed-collection');
	});
});
