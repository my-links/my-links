import type { QueryClientContract } from '@adonisjs/lucid/types/database';

import { Visibility } from '#enums/collections/visibility';

const INBOX_NAME = 'Inbox';
const INBOX_POSITION = 0;

/**
 * Gives an Inbox to every account created before it became part of registration.
 *
 * Until now the Inbox was only created the first time something needed a
 * fallback collection, so an account that never saved an uncategorised link had
 * none — and the sidebar has nothing to pin for it.
 *
 * Lives outside `database/migrations/` because that directory is scanned by the
 * migrator — every file in it is executed as a migration.
 */
export async function backfillMissingInboxCollections(
	client: QueryClientContract
): Promise<void> {
	await client.rawQuery(
		`INSERT INTO collections (author_id, name, description, visibility, icon, is_default, position, created_at, updated_at)
		 SELECT users.id, :name, NULL, :visibility::collection_visibility, NULL, true, :position, NOW(), NOW()
		 FROM users
		 WHERE NOT EXISTS (
		   SELECT 1 FROM collections
		   WHERE collections.author_id = users.id AND collections.is_default = true
		 )`,
		{
			name: INBOX_NAME,
			visibility: Visibility.PRIVATE,
			position: INBOX_POSITION,
		}
	);
}

/**
 * Brings back any Inbox shared before `updateCollection` started refusing it,
 * and drops the subscriptions that sharing handed out.
 *
 * A public Inbox is both a privacy problem — it is where every link saved
 * without a collection lands — and a broken sidebar: it would be drawn pinned
 * and inside the public section at once.
 */
export async function makeInboxesPrivate(
	client: QueryClientContract
): Promise<void> {
	await client.rawQuery(
		`DELETE FROM collection_followers
		 USING collections
		 WHERE collection_followers.collection_id = collections.id
		   AND collections.is_default
		   AND collections.visibility <> :visibility::collection_visibility`,
		{ visibility: Visibility.PRIVATE }
	);

	await client.rawQuery(
		`UPDATE collections
		 SET visibility = :visibility::collection_visibility, updated_at = NOW()
		 WHERE is_default
		   AND visibility <> :visibility::collection_visibility`,
		{ visibility: Visibility.PRIVATE }
	);
}

/**
 * Only empty Inboxes are removed: this migration cannot tell the ones it created
 * from the ones that already existed, and dropping a full one would take its
 * links with it through the pivot's `ON DELETE CASCADE`.
 */
export async function revertMissingInboxCollectionsBackfill(
	client: QueryClientContract
): Promise<void> {
	await client.rawQuery(
		`DELETE FROM collections
		 WHERE is_default = true
		   AND NOT EXISTS (
		     SELECT 1 FROM collection_link
		     WHERE collection_link.collection_id = collections.id
		   )`
	);
}
