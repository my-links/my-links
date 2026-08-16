/**
 * The activity vocabulary — what a user or an administrator did to a
 * collection, a link, or an account's data. Kept as an `as const` object
 * rather than a TypeScript enum so the values persisted in database are
 * plain strings. See `#constants/audit` for how this joins the
 * authentication vocabulary in the shared journal.
 *
 * Deliberately absent: `link.visited`. `GET /l/:id` is reachable
 * unauthenticated and is by far the hottest write path in the app —
 * journaling it would swamp the table and tell us nothing about abuse.
 */
export const ACTIVITY_EVENT_TYPE = {
	COLLECTION_CREATED: 'collection.created',
	COLLECTION_UPDATED: 'collection.updated',
	COLLECTION_DELETED: 'collection.deleted',
	COLLECTION_FOLLOWED: 'collection.followed',
	COLLECTION_UNFOLLOWED: 'collection.unfollowed',
	LINK_CREATED: 'link.created',
	LINK_UPDATED: 'link.updated',
	LINK_DELETED: 'link.deleted',
	LINK_FAVORITE_TOGGLED: 'link.favorite_toggled',
	DATA_IMPORTED: 'data.imported',
	DATA_EXPORTED: 'data.exported',
	ACCOUNT_DATA_WIPED: 'account.data_wiped',
	ACCOUNT_DELETION_REQUESTED: 'account.deletion_requested',
	ACCOUNT_REACTIVATED: 'account.reactivated',
} as const;

export type ActivityEventType =
	(typeof ACTIVITY_EVENT_TYPE)[keyof typeof ACTIVITY_EVENT_TYPE];
