import type User from '#models/user';
import Collection from '#models/collection';
import { Visibility } from '#enums/collections/visibility';

const DEFAULT_COLLECTION_NAME = 'Test collection';

const INBOX_NAME = 'Inbox';

type CollectionAttributes = {
	readonly author: User;
	readonly name?: string;
	readonly visibility?: Visibility;
};

export async function createCollection({
	author,
	name = DEFAULT_COLLECTION_NAME,
	visibility = Visibility.PRIVATE,
}: CollectionAttributes): Promise<Collection> {
	return Collection.create({
		name,
		description: null,
		visibility,
		icon: null,
		authorId: author.id,
	});
}

/**
 * The Inbox registration opens with every account. `createUser` writes the row
 * directly and skips that, so a spec about the Inbox has to ask for one.
 */
export async function createInbox(author: User): Promise<Collection> {
	return Collection.create({
		name: INBOX_NAME,
		description: null,
		visibility: Visibility.PRIVATE,
		icon: null,
		authorId: author.id,
		isDefault: true,
		position: 0,
	});
}

export async function followCollection(
	collection: Collection,
	follower: User
): Promise<void> {
	await collection.related('followers').attach([follower.id]);
}
