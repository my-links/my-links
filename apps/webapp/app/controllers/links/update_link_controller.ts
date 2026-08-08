import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { LinkService } from '#services/links/link_service';
import { updateLinkValidator } from '#validators/links/update_link_validator';

@inject()
export default class UpdateLinkController {
	constructor(protected readonly linkService: LinkService) {}

	async execute({ request, response }: HttpContext) {
		const {
			params: { id: linkId },
			...payload
		} = await request.validateUsing(updateLinkValidator);

		await this.linkService.updateLink(linkId, payload);
		return response.redirect().back();
	}
}
