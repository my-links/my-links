import type { HttpContext } from '@adonisjs/core/http';

import Collection from '#models/collection';
import type { CollectionLinkService } from '#services/collections/collection_link_service';
import { reorderCollectionLinksValidator } from '#validators/collections/reorder_collection_links_validator';

export async function reorderCollectionLinksAction(
	{ request, auth }: HttpContext,
	collectionLinkService: CollectionLinkService
): Promise<void> {
	const {
		params: { id: collectionId },
		linkIds,
	} = await request.validateUsing(reorderCollectionLinksValidator);

	const collection = await Collection.query()
		.where('id', collectionId)
		.apply((scopes) => scopes.ownedBy(auth.getUserOrFail().id))
		.firstOrFail();

	await collectionLinkService.reorderLinksInCollection(collection, linkIds);
}
