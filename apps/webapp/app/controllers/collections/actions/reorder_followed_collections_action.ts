import type { HttpContext } from '@adonisjs/core/http';

import type { CollectionService } from '#services/collections/collection_service';
import { reorderFollowedCollectionsValidator } from '#validators/collections/reorder_followed_collections_validator';

export async function reorderFollowedCollectionsAction(
	{ request }: HttpContext,
	collectionService: CollectionService
): Promise<void> {
	const { collectionIds } = await request.validateUsing(
		reorderFollowedCollectionsValidator
	);

	await collectionService.reorderFollowedCollections(collectionIds);
}
