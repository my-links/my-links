import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { resolveRequestOrigin } from '#lib/request_origin';
import { LinkService } from '#services/links/link_service';
import { updateLinkFavoriteStatusValidator } from '#validators/links/update_favorite_link_validator';

@inject()
export default class ToggleLinkFavoriteController {
	constructor(protected readonly linkService: LinkService) {}

	async execute({ request, response, auth }: HttpContext) {
		const {
			params: { id: linkId },
			favorite,
		} = await request.validateUsing(updateLinkFavoriteStatusValidator);
		await this.linkService.updateFavorite(
			auth.getUserOrFail().id,
			linkId,
			favorite,
			resolveRequestOrigin({ request })
		);
		return response.redirect().back();
	}
}
