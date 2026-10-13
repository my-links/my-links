import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { resolveRequestOrigin } from '#lib/request_origin';
import { CollectionLinkService } from '#services/collections/collection_link_service';
import { addLinkToCollectionValidator } from '#validators/links/add_link_to_collection_validator';

@inject()
export default class AddLinkToCollectionController {
	constructor(
		protected readonly collectionLinkService: CollectionLinkService
	) {}

	async execute({ request, auth, response }: HttpContext) {
		const {
			params: { id: linkId },
			collectionId,
		} = await request.validateUsing(addLinkToCollectionValidator);

		await this.collectionLinkService.addLinkToCollection(
			auth.getUserOrFail().id,
			linkId,
			collectionId,
			resolveRequestOrigin({ request })
		);

		return response.redirect().back();
	}
}
