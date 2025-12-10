import { CollectionWithLinksDto } from '#dtos/collection_with_links';
import { CollectionService } from '#services/collections/collection_service';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export default class GetCollectionsController {
	constructor(private collectionService: CollectionService) {}

	async render({ response }: HttpContext) {
		const collections =
			await this.collectionService.getCollectionsForAuthenticatedUser();
		return response.json({
			collections: CollectionWithLinksDto.fromArray(collections),
		});
	}
}
