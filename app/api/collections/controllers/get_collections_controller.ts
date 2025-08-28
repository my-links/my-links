import { CollectionService } from '#collections/services/collection_service';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export default class GetCollectionsController {
	constructor(private collectionService: CollectionService) {}

	async show({ response }: HttpContext) {
		const collections =
			await this.collectionService.getCollectionsForAuthenticatedUser();
		return response.json({
			collections: collections.map((collection) => collection.serialize()),
		});
	}
}
