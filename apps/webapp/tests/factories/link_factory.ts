import Link from '#models/link';
import type User from '#models/user';
import Collection from '#models/collection';

const DEFAULT_LINK_NAME = 'Test link';
const DEFAULT_LINK_URL = 'https://example.com';

type LinkAttributes = {
	readonly author: User;
	readonly name?: string;
	readonly url?: string;
};

export async function createLink({
	author,
	name = DEFAULT_LINK_NAME,
	url = DEFAULT_LINK_URL,
}: LinkAttributes): Promise<Link> {
	return Link.create({
		name,
		description: null,
		url,
		favorite: false,
		authorId: author.id,
	});
}

export async function attachLinkToCollection(
	link: Link,
	collection: Collection
): Promise<void> {
	await link.related('collections').attach([collection.id]);
}
