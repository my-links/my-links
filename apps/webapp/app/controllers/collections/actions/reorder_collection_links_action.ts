import type { Infer } from '@vinejs/vine/types';

import Collection from '#models/collection';
import type User from '#models/user';
import type { CollectionLinkService } from '#services/collections/collection_link_service';
import { reorderCollectionLinksValidator } from '#validators/collections/reorder_collection_links_validator';

type ReorderCollectionLinksActionInput = {
	payload: Infer<typeof reorderCollectionLinksValidator>;
	userId: User['id'];
};

export async function reorderCollectionLinksAction(
	{ payload, userId }: ReorderCollectionLinksActionInput,
	collectionLinkService: CollectionLinkService
): Promise<void> {
	const {
		params: { id: collectionId },
		linkIds,
	} = payload;

	const collection = await Collection.query()
		.where('id', collectionId)
		.apply((scopes) => scopes.ownedBy(userId))
		.firstOrFail();

	await collectionLinkService.reorderLinksInCollection(collection, linkIds);
}
