import BaseCollectionController from '#collections/controllers/base_collection_controller';
import { CollectionService } from '#collections/services/collection_service';
import { createCollectionValidator } from '#collections/validators/create_collection_validator';
import { inject } from '@adonisjs/core';
import { type HttpContext } from '@adonisjs/core/http';

@inject()
export default class CreateCollectionController extends BaseCollectionController {
	constructor(private collectionService: CollectionService) {
		super();
	}

	async render({ inertia }: HttpContext) {
		const collections = await this.collectionService.getCollectionsByAuthorId();
		return inertia.render('collections/create', {
			disableHomeLink: collections.length === 0,
		});
	}

	async execute({ request }: HttpContext) {
		const payload = await request.validateUsing(createCollectionValidator);
		const collection = await this.collectionService.createCollection(payload);
		return this.redirectToCollectionId(collection.id);
	}
}
