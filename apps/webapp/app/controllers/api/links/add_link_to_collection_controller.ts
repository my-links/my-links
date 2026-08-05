import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { CollectionLinkService } from '#services/collections/collection_link_service';
import { addLinkToCollectionValidator } from '#validators/links/add_link_to_collection_validator';

@inject()
export default class AddLinkToCollectionController {
	constructor(
		protected readonly collectionLinkService: CollectionLinkService
	) {}

	async execute({ request, response, auth }: HttpContext) {
		const {
			params: { id: linkId },
			collectionId,
		} = await request.validateUsing(addLinkToCollectionValidator);

		await this.collectionLinkService.addLinkToCollection(
			auth.getUserOrFail().id,
			linkId,
			collectionId
		);
		return response.json({ message: 'Link added to collection successfully' });
	}
}
