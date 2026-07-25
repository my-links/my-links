import type { CollectionVisibility } from '@/lib/api/types';
import type { DesiredBookmark } from '@/lib/bookmarks/desired_tree';

/**
 * A write against the native bookmarks tree, or a bookkeeping entry that only
 * touches the mapping.
 *
 * There is deliberately no "rebuild everything" operation: the previous
 * extension dropped and recreated the whole tree on every event, which is what
 * froze the browser. Nothing here can touch a node the mapping does not claim,
 * so the user's own bookmarks are invisible to a plan.
 */
export type BookmarkOperation =
	/**
	 * Carries its bookmarks rather than emitting separate creates: the parent's
	 * node id only exists once the folder has been created, which a plan
	 * computed up front cannot know.
	 */
	| {
			kind: 'create-folder';
			collectionId: number;
			title: string;
			bookmarks: DesiredBookmark[];
	  }
	| { kind: 'rename-folder'; nodeId: string; title: string }
	/** Only ever emitted when every child is a node the mirror created. */
	| { kind: 'remove-folder'; nodeId: string; collectionId: number }
	/** Drops a folder's bookkeeping while leaving the node itself alone. */
	| { kind: 'forget-folder'; collectionId: number }
	| {
			kind: 'create-bookmark';
			parentNodeId: string;
			linkKey: string;
			title: string;
			url: string;
	  }
	| { kind: 'update-bookmark'; nodeId: string; title: string; url: string }
	| { kind: 'remove-bookmark'; nodeId: string; linkKey: string }
	/** Drops a mapping entry whose node the browser has already reclaimed. */
	| { kind: 'forget-bookmark'; linkKey: string }
	/**
	 * Re-files an existing node under another key — a bookmark dragged from one
	 * collection folder to another is the same node, and re-creating it would
	 * lose its identity for no reason.
	 */
	| {
			kind: 'remap-bookmark';
			fromLinkKey: string;
			toLinkKey: string;
			nodeId: string;
	  }
	| { kind: 'move-node'; nodeId: string; parentNodeId: string }
	/**
	 * Ordering is one operation carrying the whole ranking rather than a move
	 * per node: each move renumbers its siblings, so independently computed
	 * indexes would land in the wrong final order.
	 */
	| { kind: 'reorder-pinned'; parentNodeId: string; nodeIdsInOrder: string[] };

/**
 * A node on the bar is a link's pin; one inside a collection folder is its
 * copy for that collection. An adopted node keeps the place the user chose,
 * so the mapping has to follow it rather than the other way round.
 */
export type NodePlacement = 'pinned' | 'filed';

/**
 * A write the server has to be told about.
 *
 * Never more than one per link per pass: a link dragged out of two folders at
 * once — or out of a folder *and* off the bar — has to produce a single
 * payload, or the second write would undo the first.
 */
export type ServerChange =
	| {
			kind: 'create-link';
			/** Native node being adopted — mapped to the new link once created. */
			nodeId: string;
			collectionId: number;
			name: string;
			url: string;
			/**
			 * True when the browser had just created the node, which is what
			 * saving a page does. Dragging an existing bookmark in is a move, and
			 * only files it.
			 */
			favorite: boolean;
			/** Where the adopted node sits, which is the key it is mapped under. */
			placement: NodePlacement;
	  }
	| {
			kind: 'update-link';
			linkId: number;
			name: string;
			url: string;
			description: string | null;
			favorite: boolean;
			collectionIds: number[];
	  }
	| {
			kind: 'rename-collection';
			collectionId: number;
			name: string;
			description: string | null;
			visibility: CollectionVisibility;
			icon: string | null;
	  };
