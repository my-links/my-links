import vine from '@vinejs/vine';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import LinkTransformer from '#transformers/link';
import { LinkService } from '#services/links/link_service';
import { baseLinkValidator } from '#validators/links/base_link_validator';

@inject()
export default class CreateLinkController {
	private readonly validator = vine.create(baseLinkValidator.getProperties());

	constructor(protected readonly linkService: LinkService) {}

	async execute({ request, response }: HttpContext) {
		const { collectionId, ...payload } = await request.validateUsing(
			this.validator
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
