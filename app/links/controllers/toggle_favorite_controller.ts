import { LinkService } from '#links/services/link_service';
import { updateLinkFavoriteStatusValidator } from '#links/validators/update_favorite_link_validator';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export default class ToggleFavoriteController {
	constructor(private linkService: LinkService) {}

	async toggleFavorite({ request, response }: HttpContext) {
		const { params, favorite } = await request.validateUsing(
			updateLinkFavoriteStatusValidator
		);

		await this.linkService.updateFavorite(params.id, favorite);

		return response.json({ status: 'ok' });
	}
}
