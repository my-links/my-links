import type { HttpContext } from '@adonisjs/core/http';

import type { CollectionLinkService } from '#services/collections/collection_link_service';
import { addLinkToCollectionValidator } from '#validators/links/add_link_to_collection_validator';

export async function addLinkToCollectionAction(
	{ request, auth }: HttpContext,
	collectionLinkService: CollectionLinkService
): Promise<void> {
	const {
		params: { id: linkId },
		collectionId,
	} = await request.validateUsing(addLinkToCollectionValidator);

	await collectionLinkService.addLinkToCollection(
		auth.getUserOrFail().id,
		linkId,
		collectionId
	);
}
