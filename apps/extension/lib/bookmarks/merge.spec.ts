import { describe, expect, it } from 'vitest';

import { remapOrphanedNodes } from '@/lib/bookmarks/remap';
import type { ServerChange } from '@/lib/bookmarks/operations';
import { applyBookmarkOperations } from '@/lib/bookmarks/apply';
import { reconcile, type ReconcilePlan } from '@/lib/bookmarks/merge';
import { FakeBookmarksApi } from '@/lib/bookmarks/fake_bookmarks_api';
import type { CollectionWithLinks, LinkResource } from '@/lib/api/types';
import { EMPTY_SYNCED_TREE, type SyncedTree } from '@/lib/bookmarks/snapshot';
import {
	buildPinnedLinkKey,
	collectFavoriteLinks,
} from '@/lib/bookmarks/pinned';
import {
	buildDesiredTree,
	buildLinkKey,
	type DesiredBookmark,
} from '@/lib/bookmarks/desired_tree';
import type {
	BookmarkCreateDetails,
	BookmarkNode,
	BookmarksApi,
} from '@/lib/bookmarks/bookmarks_api';
import {
	EMPTY_BOOKMARK_MAPPING,
	withMappedBookmark,
	type BookmarkMapping,
} from '@/lib/bookmarks/mapping';

const INBOX_ID = 1;
const WORK_ID = 2;
const READING_ID = 3;
const TIMESTAMP = '2026-01-01T00:00:00.000Z';

/**
 * Stands in for the instance, including the two habits that turned honest
 * pushes into runaway loops: it normalises every URL it is given, and it
 * refuses to leave a link with no collection.
 */
class FakeServer {
	private readonly collectionsById = new Map<
		number,
		Omit<CollectionWithLinks, 'links'>
	>();
	private readonly linksById = new Map<number, LinkResource>();
	private nextLinkId = 100;

	addCollection(id: number, name: string): void {
		this.collectionsById.set(id, {
			id,
			authorId: 1,
			isOwner: true,
			isDefault: id === INBOX_ID,
			createdAt: TIMESTAMP,
			updatedAt: TIMESTAMP,
			name,
			description: null,
			visibility: 'PRIVATE',
			icon: null,
		});
	}

	addLink(
		details: Pick<LinkResource, 'name' | 'url' | 'collectionIds'> &
			Partial<LinkResource>
	): LinkResource {
		const link: LinkResource = {
			id: this.claimLinkId(),
			authorId: 1,
			createdAt: TIMESTAMP,
			updatedAt: TIMESTAMP,
			description: null,
			favorite: false,
			clicks: 0,
			lastClickedAt: null,
			...details,
			url: normalizeServerUrl(details.url),
		};
		this.linksById.set(link.id, link);
		return link;
	}

	get links(): LinkResource[] {
		return [...this.linksById.values()];
	}

	get collections(): CollectionWithLinks[] {
		return [...this.collectionsById.values()].map((collection) => ({
			...collection,
			links: [...this.linksById.values()].filter((link) =>
				link.collectionIds.includes(collection.id)
			),
		}));
	}

	linkById(linkId: number): LinkResource {
		const link = this.linksById.get(linkId);
		if (!link) {
			throw new Error(`No link ${linkId} on the server`);
		}
		return link;
	}

	editLink(linkId: number, changes: Partial<LinkResource>): void {
		this.linksById.set(linkId, { ...this.linkById(linkId), ...changes });
	}

	renameCollection(collectionId: number, name: string): void {
		const collection = this.collectionsById.get(collectionId);
		if (!collection) {
			throw new Error(`No collection ${collectionId} on the server`);
		}
		this.collectionsById.set(collectionId, { ...collection, name });
	}

	deleteLink(linkId: number): void {
		this.linksById.delete(linkId);
	}

	/** Links left with nowhere to go fall back to the Inbox, as the API does. */
	deleteCollection(collectionId: number): void {
		this.collectionsById.delete(collectionId);
		for (const link of this.linksById.values()) {
			this.editLink(
				link.id,
				buildMembership(link.collectionIds.filter((id) => id !== collectionId))
			);
		}
	}

	apply(change: ServerChange): { linkKey: string; nodeId: string } | undefined {
		switch (change.kind) {
			case 'create-link': {
				const created = this.addLink({
					name: change.name,
					url: change.url,
					favorite: change.favorite,
					collectionIds: [change.collectionId],
				});
				return {
					linkKey:
						change.placement === 'pinned'
							? buildPinnedLinkKey(created.id)
							: buildLinkKey(change.collectionId, created.id),
					nodeId: change.nodeId,
				};
			}
			case 'update-link':
				this.editLink(change.linkId, {
					name: change.name,
					url: normalizeServerUrl(change.url),
					description: change.description,
					favorite: change.favorite,
					...buildMembership(change.collectionIds),
				});
				return undefined;
			case 'rename-collection':
				this.renameCollection(change.collectionId, change.name);
				return undefined;
		}
	}

	private claimLinkId(): number {
		this.nextLinkId += 1;
		return this.nextLinkId;
	}
}

function buildMembership(
	collectionIds: number[]
): Pick<LinkResource, 'collectionIds'> {
	return {
		collectionIds: collectionIds.length > 0 ? collectionIds : [INBOX_ID],
	};
}

/** Mirrors `normalizeUrl` on the API: a bare origin loses its trailing slash. */
function normalizeServerUrl(url: string): string {
	const parsed = new URL(url);
	const isBareOrigin =
		parsed.pathname === '/' && parsed.search === '' && parsed.hash === '';

	return isBareOrigin ? `${parsed.protocol}//${parsed.host}` : parsed.href;
}

/** Fails the first few writes, the way a rate-limited instance does. */
class FlakyBookmarksApi implements BookmarksApi {
	constructor(
		private readonly inner: BookmarksApi,
		private failuresLeft: number
	) {}

	async create(details: BookmarkCreateDetails): Promise<BookmarkNode> {
		if (this.failuresLeft > 0) {
			this.failuresLeft -= 1;
			throw new Error('write rejected');
		}
		return await this.inner.create(details);
	}

	getTree = () => this.inner.getTree();
	getSubTree = (id: string) => this.inner.getSubTree(id);
	move = (id: string, destination: { parentId?: string; index?: number }) =>
		this.inner.move(id, destination);
	update = (id: string, changes: { title?: string; url?: string }) =>
		this.inner.update(id, changes);
	remove = (id: string) => this.inner.remove(id);
	removeTree = (id: string) => this.inner.removeTree(id);
}

/**
 * Runs whole mirror passes: reclaim orphans, reconcile, push, write, and
 * advance the snapshot only when everything landed — the same sequence
 * `runMirrorPass` performs, so a scenario proved here is proved against the
 * real orchestration and not against a convenient subset of it.
 */
class MirrorHarness {
	readonly api = new FakeBookmarksApi();
	readonly barId: string;
	readonly collectionsFolderId: string;
	mapping: BookmarkMapping = EMPTY_BOOKMARK_MAPPING;
	snapshot: SyncedTree = EMPTY_SYNCED_TREE;
	/**
	 * The mirror was switched on at time zero, which is also what the fake
	 * browser stamps until a scenario advances its clock — so bookmarks a
	 * scenario sets up are "already there" and only the ones it saves after
	 * moving the clock read as newly saved.
	 */
	savedSince = 0;

	constructor(readonly server: FakeServer) {
		this.barId = this.api.createFolder(this.api.rootId, 'Bookmarks bar');
		this.collectionsFolderId = this.api.createFolder(this.barId, 'Collections');
	}

	async childrenOf(nodeId: string): Promise<BookmarkNode[]> {
		const [node] = await this.api.getSubTree(nodeId);
		return node?.children ?? [];
	}

	async titlesIn(nodeId: string): Promise<string[]> {
		return (await this.childrenOf(nodeId)).map((child) => child.title);
	}

	async folderIdOf(collectionId: number): Promise<string> {
		const nodeId = this.mapping.folderIdByCollectionId[String(collectionId)];
		if (!nodeId) {
			throw new Error(`Collection ${collectionId} has no folder`);
		}
		return nodeId;
	}

	async nodeIdOf(linkKey: string): Promise<string> {
		const nodeId = this.mapping.bookmarkIdByLinkKey[linkKey];
		if (!nodeId) {
			throw new Error(`No node mapped for ${linkKey}`);
		}
		return nodeId;
	}

	async plan(): Promise<ReconcilePlan> {
		const barChildren = await this.childrenOf(this.barId);
		const collections = this.server.collections;

		this.mapping = remapOrphanedNodes(
			buildDesiredTree(collections),
			collectFavoriteLinks(collections).map(toDesiredBookmark),
			barChildren.find((child) => child.id === this.collectionsFolderId)
				?.children ?? [],
			barChildren,
			this.mapping
		);

		return reconcile({
			collections,
			collectionsFolderId: this.collectionsFolderId,
			barId: this.barId,
			barChildren,
			savedSince: this.savedSince,
			mapping: this.mapping,
			snapshot: this.snapshot,
		});
	}

	async run(api: BookmarksApi = this.api): Promise<{
		plan: ReconcilePlan;
		failedOperationCount: number;
	}> {
		const plan = await this.plan();

		const mappingWithAdoptions = plan.serverChanges
			.map((change) => this.server.apply(change))
			.reduce(
				(current, adoption) =>
					adoption
						? withMappedBookmark(current, adoption.linkKey, adoption.nodeId)
						: current,
				this.mapping
			);

		const result = await applyBookmarkOperations(
			api,
			this.collectionsFolderId,
			plan.nativeOperations,
			mappingWithAdoptions
		);
		this.mapping = result.mapping;

		if (result.failedOperationCount === 0) {
			this.snapshot = { ...plan.nextSnapshot, ...result.snapshot };
		}
		return { plan, failedOperationCount: result.failedOperationCount };
	}

	/**
	 * The property the whole phase exists for: applying a plan has to leave
	 * nothing behind. Any push the server rewrites, or any node the plan
	 * mis-reads, shows up here as a second, non-empty plan.
	 */
	async expectConverged(): Promise<void> {
		const { plan, failedOperationCount } = await this.run();

		expect(failedOperationCount).toBe(0);
		expect(plan.serverChanges).toEqual([]);
		expect(plan.nativeOperations).toEqual([]);
	}

	async settle(): Promise<ReconcilePlan> {
		return await this.settleOver(1);
	}

	/**
	 * A pass can only build on what the one before it created: a bar bookmark
	 * adopted into a link gains its folder copy the pass after the link
	 * exists. `passCount` is how many the scenario is allowed before there has
	 * to be nothing left to do. The first plan is returned, since that is the
	 * one carrying the change under test.
	 */
	async settleOver(passCount: number): Promise<ReconcilePlan> {
		const firstPlan = await this.runSuccessfully();
		for (let remaining = passCount - 1; remaining > 0; remaining -= 1) {
			await this.runSuccessfully();
		}
		await this.expectConverged();
		return firstPlan;
	}

	private async runSuccessfully(): Promise<ReconcilePlan> {
		const { plan, failedOperationCount } = await this.run();
		expect(failedOperationCount).toBe(0);
		return plan;
	}
}

function toDesiredBookmark(link: LinkResource): DesiredBookmark {
	return { linkId: link.id, title: link.name, url: link.url };
}

function buildHarness(): {
	harness: MirrorHarness;
	server: FakeServer;
	docs: LinkResource;
} {
	const server = new FakeServer();
	server.addCollection(INBOX_ID, 'Inbox');
	server.addCollection(WORK_ID, 'Work');
	server.addCollection(READING_ID, 'Reading');
	const docs = server.addLink({
		name: 'Docs',
		url: 'https://docs.example.com/guide',
		collectionIds: [WORK_ID],
	});

	return { harness: new MirrorHarness(server), server, docs };
}

/** Brings the mirror to a settled state, the starting point of every scenario. */
async function buildSettledHarness(): Promise<{
	harness: MirrorHarness;
	server: FakeServer;
	docs: LinkResource;
}> {
	const built = buildHarness();
	await built.harness.settle();
	return built;
}

describe('reconcile — first pass', () => {
	it('should build the collections and their links, then have nothing left to do', async () => {
		const { harness } = buildHarness();

		await harness.settle();

		expect(await harness.titlesIn(harness.collectionsFolderId)).toEqual([
			'Inbox',
			'Work',
			'Reading',
		]);
		expect(await harness.titlesIn(await harness.folderIdOf(WORK_ID))).toEqual([
			'Docs',
		]);
	});

	it('should leave the bookmarks already on the bar exactly where they are', async () => {
		const { harness } = buildHarness();
		harness.api.createLink(
			harness.barId,
			'Their own',
			'https://own.example.com'
		);

		await harness.settle();

		expect(await harness.titlesIn(harness.barId)).toEqual([
			'Collections',
			'Their own',
		]);
	});
});

describe('reconcile — renames', () => {
	it('should push a bookmark the user renamed in the browser', async () => {
		const { harness, server, docs } = await buildSettledHarness();
		await harness.api.update(await harness.nodeIdOf(`${WORK_ID}:${docs.id}`), {
			title: 'Docs API',
		});

		const plan = await harness.settle();

		expect(plan.serverChanges).toEqual([
			expect.objectContaining({ kind: 'update-link', name: 'Docs API' }),
		]);
		expect(server.linkById(docs.id).name).toBe('Docs API');
	});

	it('should push a collection folder the user renamed in the browser', async () => {
		const { harness, server } = await buildSettledHarness();
		await harness.api.update(await harness.folderIdOf(WORK_ID), {
			title: 'Job',
		});

		const plan = await harness.settle();

		expect(plan.serverChanges).toEqual([
			expect.objectContaining({ kind: 'rename-collection', name: 'Job' }),
		]);
		expect(
			server.collections.find((collection) => collection.id === WORK_ID)?.name
		).toBe('Job');
	});

	it('should rewrite a bookmark whose link was renamed on the server', async () => {
		const { harness, server, docs } = await buildSettledHarness();
		server.editLink(docs.id, { name: 'Documentation' });

		const plan = await harness.settle();

		expect(plan.serverChanges).toEqual([]);
		expect(await harness.titlesIn(await harness.folderIdOf(WORK_ID))).toEqual([
			'Documentation',
		]);
	});

	it('should let the server win when both sides renamed the same link', async () => {
		const { harness, server, docs } = await buildSettledHarness();
		await harness.api.update(await harness.nodeIdOf(`${WORK_ID}:${docs.id}`), {
			title: 'Docs API',
		});
		server.editLink(docs.id, { name: 'Documentation' });

		const plan = await harness.settle();

		expect(plan.serverChanges).toEqual([]);
		expect(server.linkById(docs.id).name).toBe('Documentation');
		expect(await harness.titlesIn(await harness.folderIdOf(WORK_ID))).toEqual([
			'Documentation',
		]);
	});

	it('should settle a link owning both a folder copy and a pin on one title', async () => {
		const { harness, server, docs } = await buildSettledHarness();
		server.editLink(docs.id, { favorite: true });
		await harness.settle();

		await harness.api.update(await harness.nodeIdOf(`pinned:${docs.id}`), {
			title: 'Docs API',
		});
		await harness.settle();

		expect(server.linkById(docs.id).name).toBe('Docs API');
		expect(await harness.titlesIn(await harness.folderIdOf(WORK_ID))).toEqual([
			'Docs API',
		]);
	});
});

describe('reconcile — URLs', () => {
	it('should never push a URL the two sides merely normalise differently', async () => {
		const server = new FakeServer();
		server.addCollection(INBOX_ID, 'Inbox');
		server.addCollection(WORK_ID, 'Work');
		server.addLink({
			name: 'Example',
			url: 'https://example.com/',
			collectionIds: [WORK_ID],
		});
		const harness = new MirrorHarness(server);
		await harness.settle();

		// What the browser stores when handed a bare origin.
		const nodeId = (
			await harness.childrenOf(await harness.folderIdOf(WORK_ID))
		)[0]?.id;
		await harness.api.update(nodeId ?? '', { url: 'https://example.com/' });

		await harness.expectConverged();
	});

	it('should adopt a dropped bookmark once, whatever the server does to its URL', async () => {
		const { harness, server } = await buildSettledHarness();
		harness.api.createLink(
			await harness.folderIdOf(WORK_ID),
			'News',
			'https://news.example.com/'
		);

		const plan = await harness.settle();

		expect(plan.serverChanges).toEqual([
			expect.objectContaining({ kind: 'create-link', name: 'News' }),
		]);
		expect(
			server.collections
				.find((collection) => collection.id === WORK_ID)
				?.links?.map((link) => link.name)
		).toEqual(['Docs', 'News']);
		expect(await harness.titlesIn(await harness.folderIdOf(WORK_ID))).toEqual([
			'Docs',
			'News',
		]);
	});
});

describe('reconcile — membership', () => {
	it('should read a bookmark dragged into another folder as a move, not a copy', async () => {
		const { harness, docs } = await buildSettledHarness();
		await harness.api.move(await harness.nodeIdOf(`${WORK_ID}:${docs.id}`), {
			parentId: await harness.folderIdOf(READING_ID),
		});

		const plan = await harness.settle();

		expect(plan.serverChanges).toEqual([
			expect.objectContaining({ collectionIds: [READING_ID] }),
		]);
		expect(await harness.titlesIn(await harness.folderIdOf(WORK_ID))).toEqual(
			[]
		);
		expect(
			await harness.titlesIn(await harness.folderIdOf(READING_ID))
		).toEqual(['Docs']);
	});

	it('should drop only the collection the deleted bookmark belonged to', async () => {
		const { harness, server, docs } = await buildSettledHarness();
		server.editLink(docs.id, { collectionIds: [WORK_ID, READING_ID] });
		await harness.settle();

		await harness.api.remove(
			await harness.nodeIdOf(`${READING_ID}:${docs.id}`)
		);
		await harness.settle();

		expect(server.linkById(docs.id).collectionIds).toEqual([WORK_ID]);
		expect(await harness.titlesIn(await harness.folderIdOf(WORK_ID))).toEqual([
			'Docs',
		]);
	});

	it('should put the bookmark back rather than push a link with no collection', async () => {
		const { harness, server, docs } = await buildSettledHarness();
		await harness.api.remove(await harness.nodeIdOf(`${WORK_ID}:${docs.id}`));

		const plan = await harness.settle();

		expect(plan.serverChanges).toEqual([]);
		expect(server.linkById(docs.id).collectionIds).toEqual([WORK_ID]);
		expect(await harness.titlesIn(await harness.folderIdOf(WORK_ID))).toEqual([
			'Docs',
		]);
	});

	it('should put a collection folder back without deleting the collection', async () => {
		const { harness, server } = await buildSettledHarness();
		await harness.api.removeTree(await harness.folderIdOf(WORK_ID));

		const plan = await harness.settle();

		expect(plan.serverChanges).toEqual([]);
		expect(
			server.collections.some((collection) => collection.id === WORK_ID)
		).toBe(true);
		expect(await harness.titlesIn(await harness.folderIdOf(WORK_ID))).toEqual([
			'Docs',
		]);
	});
});

describe('reconcile — server-side deletions', () => {
	it('should remove the bookmarks of a link the server no longer has', async () => {
		const { harness, server, docs } = await buildSettledHarness();
		server.deleteLink(docs.id);

		await harness.settle();

		expect(await harness.titlesIn(await harness.folderIdOf(WORK_ID))).toEqual(
			[]
		);
	});

	it('should re-file a link under the Inbox when its collection is deleted', async () => {
		const { harness, server } = await buildSettledHarness();
		server.deleteCollection(WORK_ID);

		await harness.settle();

		expect(await harness.titlesIn(harness.collectionsFolderId)).toEqual([
			'Inbox',
			'Reading',
		]);
		expect(await harness.titlesIn(await harness.folderIdOf(INBOX_ID))).toEqual([
			'Docs',
		]);
	});

	it('should hand over a deleted collection folder rather than delete what the user filed in it', async () => {
		const { harness, server } = await buildSettledHarness();
		const workFolderId = await harness.folderIdOf(WORK_ID);
		// A sub-folder: the mirror is one level deep, so it never becomes a
		// link and stays the user's own content inside a folder MyLinks owns.
		harness.api.createFolder(workFolderId, 'Their own notes');
		await harness.settle();

		server.deleteCollection(WORK_ID);
		await harness.settle();

		expect(await harness.titlesIn(workFolderId)).toEqual(['Their own notes']);
	});
});

describe('reconcile — pinned favourites', () => {
	it('should pin a favourite on the bar and unpin it when the server clears the flag', async () => {
		const { harness, server, docs } = await buildSettledHarness();
		server.editLink(docs.id, { favorite: true });
		await harness.settle();

		expect(await harness.titlesIn(harness.barId)).toEqual([
			'Collections',
			'Docs',
		]);

		server.editLink(docs.id, { favorite: false });
		await harness.settle();

		expect(await harness.titlesIn(harness.barId)).toEqual(['Collections']);
	});

	it('should unfavourite a link whose pin the user deleted', async () => {
		const { harness, server, docs } = await buildSettledHarness();
		server.editLink(docs.id, { favorite: true });
		await harness.settle();

		await harness.api.remove(await harness.nodeIdOf(`pinned:${docs.id}`));
		const plan = await harness.settle();

		expect(plan.serverChanges).toEqual([
			expect.objectContaining({ kind: 'update-link', favorite: false }),
		]);
		expect(server.linkById(docs.id).favorite).toBe(false);
		expect(await harness.titlesIn(harness.barId)).toEqual(['Collections']);
	});

	it('should bring a pin dragged into a folder back onto the bar', async () => {
		const { harness, server, docs } = await buildSettledHarness();
		server.editLink(docs.id, { favorite: true });
		await harness.settle();

		await harness.api.move(await harness.nodeIdOf(`pinned:${docs.id}`), {
			parentId: await harness.folderIdOf(READING_ID),
		});
		const plan = await harness.settle();

		expect(plan.serverChanges).toEqual([]);
		expect(server.linkById(docs.id).favorite).toBe(true);
		expect(await harness.titlesIn(harness.barId)).toEqual([
			'Collections',
			'Docs',
		]);
	});
});

describe('reconcile — bookmarks saved onto the bar', () => {
	it('should turn a bookmark saved with the native star into a favourite in the default collection', async () => {
		const { harness, server } = await buildSettledHarness();
		harness.api.clock = 1;
		harness.api.createLink(
			harness.barId,
			'Saved',
			'https://saved.example.com/a'
		);

		const plan = await harness.settleOver(2);

		expect(plan.serverChanges).toEqual([
			expect.objectContaining({
				kind: 'create-link',
				collectionId: INBOX_ID,
				name: 'Saved',
				favorite: true,
				placement: 'pinned',
			}),
		]);
		const saved = server.links.find((link) => link.name === 'Saved');
		expect(saved?.favorite).toBe(true);
		expect(saved?.collectionIds).toEqual([INBOX_ID]);
	});

	it('should leave the node where the user saved it and keep it as the link pin', async () => {
		const { harness, server } = await buildSettledHarness();
		harness.api.clock = 1;
		const nodeId = harness.api.createLink(
			harness.barId,
			'Saved',
			'https://saved.example.com/a'
		);

		await harness.settleOver(2);

		const saved = server.links.find((link) => link.name === 'Saved');
		expect(await harness.nodeIdOf(buildPinnedLinkKey(saved?.id ?? 0))).toBe(
			nodeId
		);
		expect(await harness.titlesIn(harness.barId)).toEqual([
			'Collections',
			'Saved',
		]);
		expect(await harness.titlesIn(await harness.folderIdOf(INBOX_ID))).toEqual([
			'Saved',
		]);
	});

	it('should push a rename of a bookmark it adopted off the bar', async () => {
		const { harness, server } = await buildSettledHarness();
		harness.api.clock = 1;
		const nodeId = harness.api.createLink(
			harness.barId,
			'Saved',
			'https://saved.example.com/a'
		);
		await harness.settleOver(2);

		await harness.api.update(nodeId, { title: 'Saved for later' });
		await harness.settle();

		expect(server.links.map((link) => link.name)).toContain('Saved for later');
	});

	it('should leave alone a bookmark the bar already held when the mirror was switched on', async () => {
		const { harness, server } = await buildSettledHarness();
		harness.api.createLink(harness.barId, 'Theirs', 'https://own.example.com');

		await harness.settle();

		expect(server.links.map((link) => link.name)).not.toContain('Theirs');
		expect(await harness.titlesIn(harness.barId)).toEqual([
			'Collections',
			'Theirs',
		]);
	});

	it('should never adopt a pin it put on the bar itself', async () => {
		const { harness, server, docs } = await buildSettledHarness();
		harness.api.clock = 1;
		server.editLink(docs.id, { favorite: true });

		await harness.settle();

		expect(server.links).toHaveLength(1);
	});

	it('should ignore a bookmark saved inside one of the user own folders', async () => {
		const { harness, server } = await buildSettledHarness();
		const ownFolderId = harness.api.createFolder(harness.barId, 'Theirs');
		harness.api.clock = 1;
		harness.api.createLink(
			ownFolderId,
			'Filed away',
			'https://own.example.com'
		);

		await harness.settle();

		expect(server.links.map((link) => link.name)).not.toContain('Filed away');
	});
});

/**
 * Chromium saves a new bookmark into the most recently modified folder, and
 * the mirror writes into its own folders on every pass — so the star button
 * lands wherever it likes, and being in a collection folder says nothing
 * about how the bookmark got there.
 */
describe('reconcile — bookmarks saved into a collection folder', () => {
	it('should favourite a bookmark the browser created inside a collection folder', async () => {
		const { harness, server } = await buildSettledHarness();
		harness.api.clock = 1;
		harness.api.createLink(
			await harness.folderIdOf(WORK_ID),
			'Saved',
			'https://saved.example.com/a'
		);

		const plan = await harness.settleOver(2);

		expect(plan.serverChanges).toEqual([
			expect.objectContaining({
				kind: 'create-link',
				collectionId: WORK_ID,
				favorite: true,
				placement: 'filed',
			}),
		]);
		expect(server.links.find((link) => link.name === 'Saved')?.favorite).toBe(
			true
		);
	});

	it('should leave a bookmark the browser created in the folder it landed in', async () => {
		const { harness, server } = await buildSettledHarness();
		harness.api.clock = 1;
		const nodeId = harness.api.createLink(
			await harness.folderIdOf(WORK_ID),
			'Saved',
			'https://saved.example.com/a'
		);

		await harness.settleOver(2);

		const saved = server.links.find((link) => link.name === 'Saved');
		expect(saved?.collectionIds).toEqual([WORK_ID]);
		expect(await harness.nodeIdOf(`${WORK_ID}:${saved?.id ?? 0}`)).toBe(nodeId);
		expect(await harness.titlesIn(await harness.folderIdOf(WORK_ID))).toEqual([
			'Docs',
			'Saved',
		]);
	});

	it('should pin a bookmark it favourited on adoption without moving the node itself', async () => {
		const { harness, server } = await buildSettledHarness();
		harness.api.clock = 1;
		harness.api.createLink(
			await harness.folderIdOf(WORK_ID),
			'Saved',
			'https://saved.example.com/a'
		);

		await harness.settleOver(2);

		expect(server.links).toHaveLength(2);
		expect(await harness.titlesIn(harness.barId)).toEqual([
			'Collections',
			'Saved',
		]);
	});

	it('should only file a bookmark dragged in from elsewhere, never favourite it', async () => {
		const { harness, server } = await buildSettledHarness();
		const ownNodeId = harness.api.createLink(
			harness.barId,
			'Theirs',
			'https://own.example.com'
		);
		harness.api.clock = 1;
		await harness.api.move(ownNodeId, {
			parentId: await harness.folderIdOf(READING_ID),
		});

		const plan = await harness.settleOver(1);

		expect(plan.serverChanges).toEqual([
			expect.objectContaining({
				kind: 'create-link',
				collectionId: READING_ID,
				favorite: false,
				placement: 'filed',
			}),
		]);
		expect(server.links.find((link) => link.name === 'Theirs')?.favorite).toBe(
			false
		);
		expect(await harness.titlesIn(harness.barId)).toEqual(['Collections']);
	});
});

describe('reconcile — recovering from a broken pass', () => {
	it('should finish the job without duplicating anything after a half-applied pass', async () => {
		const { harness } = buildHarness();

		const { failedOperationCount } = await harness.run(
			new FlakyBookmarksApi(harness.api, 1)
		);
		expect(failedOperationCount).toBe(1);

		await harness.settle();

		expect(
			(await harness.titlesIn(harness.collectionsFolderId)).sort()
		).toEqual(['Inbox', 'Reading', 'Work']);
		expect(await harness.titlesIn(await harness.folderIdOf(WORK_ID))).toEqual([
			'Docs',
		]);
	});

	it('should reclaim its own nodes instead of duplicating them when the mapping is lost', async () => {
		const { harness, server, docs } = await buildSettledHarness();
		server.editLink(docs.id, { favorite: true });
		await harness.settle();

		harness.mapping = EMPTY_BOOKMARK_MAPPING;
		harness.snapshot = EMPTY_SYNCED_TREE;

		await harness.settle();

		expect(await harness.titlesIn(harness.collectionsFolderId)).toEqual([
			'Inbox',
			'Work',
			'Reading',
		]);
		expect(await harness.titlesIn(await harness.folderIdOf(WORK_ID))).toEqual([
			'Docs',
		]);
		expect(await harness.titlesIn(harness.barId)).toEqual([
			'Collections',
			'Docs',
		]);
	});

	it('should never propose removing a node it did not create', async () => {
		const { harness, server, docs } = await buildSettledHarness();
		harness.api.createLink(
			harness.barId,
			'Their own',
			'https://own.example.com'
		);
		server.deleteLink(docs.id);

		await harness.settle();

		expect(await harness.titlesIn(harness.barId)).toEqual([
			'Collections',
			'Their own',
		]);
	});
});
