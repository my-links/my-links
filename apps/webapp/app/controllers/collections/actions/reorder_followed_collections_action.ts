import type { HttpContext } from '@adonisjs/core/http';

import type { CollectionFollowerService } from '#services/collections/collection_follower_service';
import { reorderFollowedCollectionsValidator } from '#validators/collections/reorder_followed_collections_validator';

export async function reorderFollowedCollectionsAction(
	{ request }: HttpContext,
	collectionFollowerService: CollectionFollowerService
): Promise<void> {
	const { collectionIds } = await request.validateUsing(
		reorderFollowedCollectionsValidator
	);

	await collectionFollowerService.reorderFollowedCollections(collectionIds);
}
