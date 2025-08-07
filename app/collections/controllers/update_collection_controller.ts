import BaseCollectionController from '#collections/controllers/base_collection_controller';
import { CollectionService } from '#collections/services/collection_service';
import { updateCollectionValidator } from '#collections/validators/update_collection_validator';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export default class UpdateCollectionController extends BaseCollectionController {
	constructor(private collectionService: CollectionService) {
		super();
	}

	async render({ inertia }: HttpContext) {
		const collectionId = await this.validateCollectionId();
		if (!collectionId) return;

		const collection =
			await this.collectionService.getCollectionById(collectionId);
		return inertia.render('collections/update', {
			collection: collection.serialize(),
		});
	}

	async execute({ request }: HttpContext) {
		const {
			params: { id: collectionId },
			...payload
		} = await request.validateUsing(updateCollectionValidator);

		await this.collectionService.updateCollection(collectionId, payload);
		return this.redirectToCollectionId(collectionId);
	}
}
