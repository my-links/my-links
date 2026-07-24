import type {
	BookmarkChanges,
	BookmarkCreateDetails,
	BookmarkDestination,
	BookmarkNode,
	BookmarksApi,
} from '@/lib/bookmarks/bookmarks_api';

type StoredNode = {
	id: string;
	parentId?: string;
	title: string;
	url?: string;
};

/**
 * In-memory stand-in for `browser.bookmarks`, used by the bookmark specs.
 *
 * WXT's fake browser throws "not implemented" for every `bookmarks` method,
 * and the mirror's whole job is a sequence of native writes — testing it
 * against a real tree structure is the only way to catch ordering and
 * parenting mistakes. Sibling order is the insertion order, which is all the
 * mirror ever relies on.
 */
export class FakeBookmarksApi implements BookmarksApi {
	private readonly nodes = new Map<string, StoredNode>();
	private readonly childIdsByParentId = new Map<string, string[]>();
	private nextId = 0;

	constructor(rootTitle = 'root') {
		this.insert({ id: this.claimId(), title: rootTitle });
	}

	/** Chromium numbers the tree root `0` and the bookmarks bar `1`. */
	get rootId(): string {
		return '0';
	}

	createFolder(parentId: string, title: string): string {
		const id = this.claimId();
		this.insert({ id, parentId, title });
		return id;
	}

	createLink(parentId: string, title: string, url: string): string {
		const id = this.claimId();
		this.insert({ id, parentId, title, url });
		return id;
	}

	async getTree(): Promise<BookmarkNode[]> {
		return [this.buildNode(this.rootId)];
	}

	async getSubTree(id: string): Promise<BookmarkNode[]> {
		if (!this.nodes.has(id)) {
			throw new Error(`Can't find bookmark for id "${id}".`);
		}
		return [this.buildNode(id)];
	}

	async create(details: BookmarkCreateDetails): Promise<BookmarkNode> {
		const id = this.claimId();
		this.insert({
			id,
			parentId: details.parentId,
			title: details.title ?? '',
			url: details.url,
		});
		return this.buildNode(id);
	}

	async move(
		id: string,
		destination: BookmarkDestination
	): Promise<BookmarkNode> {
		const node = this.getStoredNode(id);
		this.detachFromParent(id);
		node.parentId = destination.parentId ?? node.parentId;
		this.attachToParent(node);
		return this.buildNode(id);
	}

	async update(id: string, changes: BookmarkChanges): Promise<BookmarkNode> {
		const node = this.getStoredNode(id);
		node.title = changes.title ?? node.title;
		node.url = changes.url ?? node.url;
		return this.buildNode(id);
	}

	async remove(id: string): Promise<void> {
		this.detachFromParent(id);
		this.nodes.delete(id);
		this.childIdsByParentId.delete(id);
	}

	async removeTree(id: string): Promise<void> {
		// Safe to iterate while removing: every mutation swaps in a fresh
		// array rather than editing this one in place.
		for (const childId of this.childIdsOf(id)) {
			await this.removeTree(childId);
		}
		await this.remove(id);
	}

	private claimId(): string {
		const id = String(this.nextId);
		this.nextId += 1;
		return id;
	}

	private insert(node: StoredNode): void {
		this.nodes.set(node.id, node);
		this.attachToParent(node);
	}

	private attachToParent(node: StoredNode): void {
		if (node.parentId === undefined) {
			return;
		}
		this.childIdsByParentId.set(node.parentId, [
			...this.childIdsOf(node.parentId),
			node.id,
		]);
	}

	private detachFromParent(id: string): void {
		const parentId = this.nodes.get(id)?.parentId;
		if (parentId === undefined) {
			return;
		}
		this.childIdsByParentId.set(
			parentId,
			this.childIdsOf(parentId).filter((childId) => childId !== id)
		);
	}

	private childIdsOf(id: string): string[] {
		return this.childIdsByParentId.get(id) ?? [];
	}

	private getStoredNode(id: string): StoredNode {
		const node = this.nodes.get(id);
		if (!node) {
			throw new Error(`Can't find bookmark for id "${id}".`);
		}
		return node;
	}

	private buildNode(id: string): BookmarkNode {
		const node = this.getStoredNode(id);
		const children = this.childIdsOf(id);

		return {
			id: node.id,
			parentId: node.parentId,
			title: node.title,
			url: node.url,
			children:
				node.url === undefined
					? children.map((childId) => this.buildNode(childId))
					: undefined,
		};
	}
}
