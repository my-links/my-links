import type { Infer } from '@vinejs/vine/types';

import type User from '#models/user';
import type Collection from '#models/collection';
import type { RequestOrigin } from '#lib/request_origin';
import type { LinkService } from '#services/links/link_service';
import type { LinkQueryService } from '#services/links/link_query_service';
import { deleteLinkValidator } from '#validators/links/delete_link_validator';

type DeleteLinkActionInput = {
	payload: Infer<typeof deleteLinkValidator>;
	userId: User['id'];
	origin: RequestOrigin;
};

/**
 * The primary collection is read back before the delete purely for the
 * web controller's redirect target: the API controller ignores it.
 */
export async function deleteLinkAction(
	{ payload, userId, origin }: DeleteLinkActionInput,
	linkService: LinkService,
	linkQueryService: LinkQueryService
): Promise<{ primaryCollectionId: Collection['id'] }> {
	const { params } = payload;

	const link = await linkQueryService.getLinkById(params.id, userId);
	const [primaryCollection] = link.collections;

	await linkService.deleteLink(userId, params.id, origin);

	return { primaryCollectionId: primaryCollection.id };
}
