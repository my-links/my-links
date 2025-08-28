import { LinkService } from '#links/services/link_service';
import { updateLinkValidator } from '#links/validators/update_link_validator';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export default class UpdateLinkController {
	constructor(private linkService: LinkService) {}

	async execute({ request, response }: HttpContext) {
		const { params, ...payload } =
			await request.validateUsing(updateLinkValidator);

		await this.linkService.updateLink(params.id, payload);
		return response.json({
			message: 'Link updated successfully',
		});
	}
}
