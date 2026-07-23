import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import LinkTransformer from '#transformers/link';
import { LinkService } from '#services/links/link_service';
import { createLinkApiValidator } from '#validators/links/create_link_api_validator';

@inject()
export default class CreateLinkController {
	constructor(protected readonly linkService: LinkService) {}

	async execute({ request, response }: HttpContext) {
		const { collectionId, ...payload } = await request.validateUsing(
			createLinkApiValidator
		);

		const link = await this.linkService.createLink({
			...payload,
			collectionId,
		});
		return response.json({
			message: 'Link created successfully',
			link: LinkTransformer.transform(link),
		});
	}
}
