import { CollectionDto } from '#dtos/collection';
import { CollectionService } from '#services/collections/collection_service';
import { updateCollectionValidator } from '#validators/collections/update_collection_validator';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export default class UpdateCollectionController {
	constructor(private collectionService: CollectionService) {}

	async render({ inertia }: HttpContext) {
		const collectionId = await this.collectionService.validateCollectionId();
		if (!collectionId) return;

		const collection =
			await this.collectionService.getCollectionById(collectionId);
		return inertia.render('collections/edit', {
			collection: new CollectionDto(collection).serialize(),
		});
	}

	async execute({ request }: HttpContext) {
		const {
			params: { id: collectionId },
			...payload
		} = await request.validateUsing(updateCollectionValidator);

		await this.collectionService.updateCollection(collectionId, {
			name: payload.name,
			description: payload.description,
			visibility: payload.visibility,
		});
		return this.collectionService.redirectToCollectionId(collectionId);
	}
}
