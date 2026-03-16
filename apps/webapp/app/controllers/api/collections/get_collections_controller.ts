import { CollectionService } from '#services/collections/collection_service';
import CollectionTransformer from '#transformers/collection';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export default class GetCollectionsController {
	constructor(protected readonly collectionService: CollectionService) {}

	async render({ response }: HttpContext) {
		const collections =
			await this.collectionService.getCollectionsForAuthenticatedUser();
		return response.json({
			collections:
				CollectionTransformer.transform(collections).useVariant('withLinks'),
		});
	}
}
