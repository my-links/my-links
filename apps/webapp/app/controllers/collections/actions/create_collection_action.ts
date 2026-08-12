import type { HttpContext } from '@adonisjs/core/http';

import type Collection from '#models/collection';
import type { CollectionService } from '#services/collections/collection_service';
import { createCollectionValidator } from '#validators/collections/create_collection_validator';

export async function createCollectionAction(
	{ request }: HttpContext,
	collectionService: CollectionService
): Promise<Collection> {
	const payload = await request.validateUsing(createCollectionValidator);

	return collectionService.createCollection({
		name: payload.name,
		description: payload.description,
		visibility: payload.visibility,
		icon: payload.icon ?? null,
	});
}
