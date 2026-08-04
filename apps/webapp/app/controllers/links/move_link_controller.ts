import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { moveLinkValidator } from '#validators/links/move_link_validator';
import { CollectionLinkService } from '#services/collections/collection_link_service';

@inject()
export default class MoveLinkController {
	constructor(
		protected readonly collectionLinkService: CollectionLinkService
	) {}

	async execute({ request, response, auth }: HttpContext) {
		const {
			params: { id: linkId },
			fromCollectionId,
			toCollectionId,
		} = await request.validateUsing(moveLinkValidator);

		await this.collectionLinkService.moveLinkBetweenCollections(
			auth.getUserOrFail().id,
			linkId,
			fromCollectionId,
			toCollectionId
		);
		return response.redirect().back();
	}
}
