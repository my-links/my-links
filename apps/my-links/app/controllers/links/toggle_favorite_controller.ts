import { LinkService } from '#services/links/link_service';
import { updateLinkFavoriteStatusValidator } from '#validators/links/update_favorite_link_validator';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export default class ToggleLinkFavoriteController {
	constructor(private linkService: LinkService) {}

	async execute({ request, response }: HttpContext) {
		const {
			params: { id: linkId },
			favorite,
		} = await request.validateUsing(updateLinkFavoriteStatusValidator);
		await this.linkService.updateFavorite(linkId, favorite);
		return response.redirect().back();
	}
}
