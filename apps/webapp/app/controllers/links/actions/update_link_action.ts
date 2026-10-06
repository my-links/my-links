import type { HttpContext } from '@adonisjs/core/http';

import { resolveRequestOrigin } from '#lib/request_origin';
import type { LinkService } from '#services/links/link_service';
import { updateLinkValidator } from '#validators/links/update_link_validator';

export async function updateLinkAction(
	{ request, auth }: HttpContext,
	linkService: LinkService
): Promise<void> {
	const { params, ...payload } =
		await request.validateUsing(updateLinkValidator);

	await linkService.updateLink(
		auth.getUserOrFail().id,
		params.id,
		payload,
		resolveRequestOrigin({ request })
	);
}
