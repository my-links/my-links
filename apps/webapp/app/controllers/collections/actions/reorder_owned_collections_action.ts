import type { HttpContext } from '@adonisjs/core/http';

import type { CollectionOrderingService } from '#services/collections/collection_ordering_service';
import { reorderCollectionsValidator } from '#validators/collections/reorder_collections_validator';

export async function reorderOwnedCollectionsAction(
	{ request, auth }: HttpContext,
	collectionOrderingService: CollectionOrderingService
): Promise<void> {
	const { visibility, collectionIds } = await request.validateUsing(
		reorderCollectionsValidator
	);

	await collectionOrderingService.reorderOwnedCollections(
		auth.getUserOrFail().id,
		visibility,
		collectionIds
	);
}
