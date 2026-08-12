import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { LinkService } from '#services/links/link_service';
import { createLinkValidator } from '#validators/links/create_link_validator';

@inject()
export default class CreateLinkController {
	constructor(protected readonly linkService: LinkService) {}

	async execute({ request, response }: HttpContext) {
		const { collectionIds, ...payload } =
			await request.validateUsing(createLinkValidator);

		await this.linkService.createLink({ ...payload, collectionIds });
		return response.redirect().back();
	}
}
