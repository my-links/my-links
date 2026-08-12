import type { HttpContext } from '@adonisjs/core/http';

import type { CollectionService } from '#services/collections/collection_service';
import { deleteCollectionValidator } from '#validators/collections/delete_collection_validator';

export async function deleteCollectionAction(
	{ request }: HttpContext,
	collectionService: CollectionService
): Promise<void> {
	const { params } = await request.validateUsing(deleteCollectionValidator);

	await collectionService.deleteCollection(params.id);
}
