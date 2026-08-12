import type { HttpContext } from '@adonisjs/core/http';

import type { CollectionService } from '#services/collections/collection_service';
import { reorderCollectionsValidator } from '#validators/collections/reorder_collections_validator';

export async function reorderOwnedCollectionsAction(
	{ request }: HttpContext,
	collectionService: CollectionService
): Promise<void> {
	const { visibility, collectionIds } = await request.validateUsing(
		reorderCollectionsValidator
	);

	await collectionService.reorderOwnedCollections(visibility, collectionIds);
}
