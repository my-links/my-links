import type User from '#models/user';
import Collection from '#models/collection';
import { Visibility } from '#enums/collections/visibility';

const DEFAULT_COLLECTION_NAME = 'Test collection';

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

export async function followCollection(
	collection: Collection,
	follower: User
): Promise<void> {
	await collection.related('followers').attach([follower.id]);
}
