/**
 * Narrow port over `browser.bookmarks`.
 *
 * Everything that decides *what* to write to the native tree depends on this
 * interface rather than on the global `browser` object, so the diff and the
 * takeover logic can be exercised against an in-memory tree in tests — the
 * fake browser shipped with WXT throws "not implemented" for every
 * `bookmarks` method.
 */

export type BookmarkNode = {
	id: string;
	parentId?: string;
	title: string;
	url?: string;
	index?: number;
	/**
	 * When the browser created the node. The only timestamp the API offers
	 * that says anything about a node's origin — there is none for edits — and
	 * it is what keeps the mirror from swallowing a bar full of bookmarks that
	 * predate it.
	 */
	dateAdded?: number;
	children?: BookmarkNode[];
};

export type BookmarkCreateDetails = {
	parentId?: string;
	title?: string;
	url?: string;
	index?: number;
};

export type BookmarkChanges = {
	title?: string;
	url?: string;
};

export type BookmarkDestination = {
	parentId?: string;
	index?: number;
};

export type BookmarksApi = {
	getTree(): Promise<BookmarkNode[]>;
	getSubTree(id: string): Promise<BookmarkNode[]>;
	create(details: BookmarkCreateDetails): Promise<BookmarkNode>;
	move(id: string, destination: BookmarkDestination): Promise<BookmarkNode>;
	update(id: string, changes: BookmarkChanges): Promise<BookmarkNode>;
	remove(id: string): Promise<void>;
	removeTree(id: string): Promise<void>;
};

export function isFolder(node: BookmarkNode): boolean {
	return node.url === undefined;
}

/**
 * Indexes a subtree, not just its top level. Anything resolving a mapped node
 * id has to search the whole subtree: a node the user dragged into a folder
 * is misplaced, not gone, and reading it as deleted would propagate a removal
 * the user never asked for.
 */
export function indexBySubtreeId(
	nodes: BookmarkNode[]
): Map<string, BookmarkNode> {
	const nodesById = new Map<string, BookmarkNode>();

	const visit = (candidates: BookmarkNode[]): void => {
		for (const node of candidates) {
			nodesById.set(node.id, node);
			visit(node.children ?? []);
		}
	};
	visit(nodes);

	return nodesById;
}

export function getBrowserBookmarksApi(): BookmarksApi {
	return {
		getTree: () => browser.bookmarks.getTree(),
		getSubTree: (id) => browser.bookmarks.getSubTree(id),
		create: (details) => browser.bookmarks.create(details),
		move: (id, destination) => browser.bookmarks.move(id, destination),
		update: (id, changes) => browser.bookmarks.update(id, changes),
		remove: async (id) => {
			await browser.bookmarks.remove(id);
		},
		removeTree: async (id) => {
			await browser.bookmarks.removeTree(id);
		},
	};
}
