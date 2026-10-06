import type { HttpContext } from '@adonisjs/core/http';

import type Collection from '#models/collection';
import { resolveRequestOrigin } from '#lib/request_origin';
import type { CollectionService } from '#services/collections/collection_service';
import { createCollectionValidator } from '#validators/collections/create_collection_validator';

export async function createCollectionAction(
	{ request, auth }: HttpContext,
	collectionService: CollectionService
): Promise<Collection> {
	const payload = await request.validateUsing(createCollectionValidator);

	return collectionService.createCollection(
		auth.getUserOrFail().id,
		{
			name: payload.name,
			description: payload.description,
			visibility: payload.visibility,
			icon: payload.icon ?? null,
		},
		resolveRequestOrigin({ request })
	);
}
