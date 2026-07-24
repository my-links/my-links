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
