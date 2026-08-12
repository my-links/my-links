import type { HttpContext } from '@adonisjs/core/http';

import type Collection from '#models/collection';
import type { LinkService } from '#services/links/link_service';
import { deleteLinkValidator } from '#validators/links/delete_link_validator';

/**
 * The primary collection is read back before the delete purely for the
 * web controller's redirect target — the API controller ignores it.
 */
export async function deleteLinkAction(
	{ request, auth }: HttpContext,
	linkService: LinkService
): Promise<{ primaryCollectionId: Collection['id'] }> {
	const { params } = await request.validateUsing(deleteLinkValidator);

	const link = await linkService.getLinkById(
		params.id,
		auth.getUserOrFail().id
	);
	const [primaryCollection] = link.collections;

	await linkService.deleteLink(params.id);

	return { primaryCollectionId: primaryCollection.id };
}
