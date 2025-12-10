import { CollectionService } from '#services/collections/collection_service';
import { createCollectionValidator } from '#validators/collections/create_collection_validator';
import { inject } from '@adonisjs/core';
import { type HttpContext } from '@adonisjs/core/http';

@inject()
export default class CreateCollectionController {
	constructor(private collectionService: CollectionService) {}

	async execute({ request, response }: HttpContext) {
		console.log('avant');
		const payload = await request.validateUsing(createCollectionValidator);
		const collection = await this.collectionService.createCollection({
			name: payload.name,
			description: payload.description,
			visibility: payload.visibility,
		});
		console.log('après', collection);
		return response.json({
			message: 'Collection created successfully',
			collection: collection.serialize(),
		});
	}
}
