import type { HttpContext } from '@adonisjs/core/http';

import type Collection from '#models/collection';
import { resolveRequestOrigin } from '#lib/request_origin';
import type { LinkService } from '#services/links/link_service';
import type { LinkQueryService } from '#services/links/link_query_service';
import { deleteLinkValidator } from '#validators/links/delete_link_validator';

/**
 * The primary collection is read back before the delete purely for the
 * web controller's redirect target: the API controller ignores it.
 */
export async function deleteLinkAction(
	{ request, auth }: HttpContext,
	linkService: LinkService,
	linkQueryService: LinkQueryService
): Promise<{ primaryCollectionId: Collection['id'] }> {
	const { params } = await request.validateUsing(deleteLinkValidator);

	const userId = auth.getUserOrFail().id;
	const link = await linkQueryService.getLinkById(params.id, userId);
	const [primaryCollection] = link.collections;

	await linkService.deleteLink(
		userId,
		params.id,
		resolveRequestOrigin({ request })
	);

	return { primaryCollectionId: primaryCollection.id };
}
