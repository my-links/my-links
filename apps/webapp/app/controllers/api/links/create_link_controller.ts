import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import LinkTransformer from '#transformers/link';
import { resolveRequestOrigin } from '#lib/request_origin';
import { LinkService } from '#services/links/link_service';
import { createLinkApiValidator } from '#validators/links/create_link_api_validator';

@inject()
export default class CreateLinkController {
	constructor(protected readonly linkService: LinkService) {}

	async execute({ request, response, serialize, auth }: HttpContext) {
		const { collectionIds, ...payload } = await request.validateUsing(
			createLinkApiValidator
		);

		const link = await this.linkService.createLink(
			auth.getUserOrFail().id,
			{ ...payload, collectionIds },
			resolveRequestOrigin({ request })
		);
		const { data: serializedLink } = await serialize(
			LinkTransformer.transform(link).useVariant('withCollections')
		);
		return response.json({
			message: 'Link created successfully',
			link: serializedLink,
		});
	}
}
