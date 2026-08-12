import type { HttpContext } from '@adonisjs/core/http';

import type { LinkService } from '#services/links/link_service';
import { updateLinkValidator } from '#validators/links/update_link_validator';

export async function updateLinkAction(
	{ request }: HttpContext,
	linkService: LinkService
): Promise<void> {
	const { params, ...payload } =
		await request.validateUsing(updateLinkValidator);

	await linkService.updateLink(params.id, payload);
}
