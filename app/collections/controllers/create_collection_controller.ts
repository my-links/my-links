import { CollectionService } from '#collections/services/collection_service';
import { createCollectionValidator } from '#collections/validators/create_collection_validator';
import { inject } from '@adonisjs/core';
import { type HttpContext } from '@adonisjs/core/http';

@inject()
export default class CreateCollectionController {
	constructor(private collectionService: CollectionService) {}

	async render({ inertia }: HttpContext) {
		const collections =
			await this.collectionService.getCollectionsForAuthenticatedUser();
		return inertia.render('collections/create', {
			disableHomeLink: collections.length === 0,
		});
	}

	async execute({ request }: HttpContext) {
		const payload = await request.validateUsing(createCollectionValidator);
		const collection = await this.collectionService.createCollection(payload);
		return this.collectionService.redirectToCollectionId(collection.id);
	}
}
