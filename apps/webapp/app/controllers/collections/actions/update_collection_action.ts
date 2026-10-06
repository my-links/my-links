import type { HttpContext } from '@adonisjs/core/http';

import { resolveRequestOrigin } from '#lib/request_origin';
import type { CollectionService } from '#services/collections/collection_service';
import { updateCollectionValidator } from '#validators/collections/update_collection_validator';

export async function updateCollectionAction(
	{ request, auth }: HttpContext,
	collectionService: CollectionService
): Promise<void> {
	const {
		params: { id: collectionId },
		...payload
	} = await request.validateUsing(updateCollectionValidator);

	await collectionService.updateCollection(
		auth.getUserOrFail().id,
		collectionId,
		{
			name: payload.name,
			description: payload.description,
			visibility: payload.visibility,
			icon: payload.icon ?? null,
		},
		resolveRequestOrigin({ request })
	);
}
