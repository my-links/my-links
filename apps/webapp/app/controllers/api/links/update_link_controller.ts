import { LinkService } from '#services/links/link_service';
import { updateLinkValidator } from '#validators/links/update_link_validator';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export default class UpdateLinkController {
	constructor(protected readonly linkService: LinkService) {}

	async execute({ request, response }: HttpContext) {
		const { params, ...payload } =
			await request.validateUsing(updateLinkValidator);

		await this.linkService.updateLink(params.id, payload);
		return response.json({
			message: 'Link updated successfully',
		});
	}
}
