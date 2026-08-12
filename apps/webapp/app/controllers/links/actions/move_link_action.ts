import type { HttpContext } from '@adonisjs/core/http';

import { moveLinkValidator } from '#validators/links/move_link_validator';
import type { CollectionLinkService } from '#services/collections/collection_link_service';

export async function moveLinkAction(
	{ request, auth }: HttpContext,
	collectionLinkService: CollectionLinkService
): Promise<void> {
	const {
		params: { id: linkId },
		fromCollectionId,
		toCollectionId,
	} = await request.validateUsing(moveLinkValidator);

	await collectionLinkService.moveLinkBetweenCollections(
		auth.getUserOrFail().id,
		linkId,
		fromCollectionId,
		toCollectionId
	);
}
