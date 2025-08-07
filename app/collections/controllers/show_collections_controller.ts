import BaseCollectionController from '#collections/controllers/base_collection_controller';
import { CollectionService } from '#collections/services/collection_service';
import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

@inject()
export default class ShowCollectionsController extends BaseCollectionController {
	constructor(private collectionService: CollectionService) {
		super();
	}

	// Dashboard
	async render({ inertia, response }: HttpContext) {
		const activeCollectionId = await this.validateCollectionId(false);
		const collections = await this.collectionService.getCollectionsByAuthorId();
		if (collections.length === 0) {
			return response.redirectToNamedRoute('collection.create-form');
		}

		const activeCollection = collections.find(
			(c) => c.id === activeCollectionId
		);

		if (!activeCollection && !!activeCollectionId) {
			return response.redirectToNamedRoute('dashboard');
		}

		return inertia.render('dashboard', {
			collections: collections.map((collection) => collection.serialize()),
			activeCollection:
				activeCollection?.serialize() || collections[0].serialize(),
		});
	}
}
