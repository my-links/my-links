import { CollectionService } from '#collections/services/collection_service';
import { createCollectionValidator } from '#collections/validators/create_collection_validator';
import { inject } from '@adonisjs/core';
import { type HttpContext } from '@adonisjs/core/http';

@inject()
export default class CreateCollectionController {
	constructor(private collectionService: CollectionService) {}

	async execute({ request, response }: HttpContext) {
		console.log('avant');
		const payload = await request.validateUsing(createCollectionValidator);
		const collection = await this.collectionService.createCollection(payload);
		console.log('après', collection);
		return response.json({
			message: 'Collection created successfully',
			collection: collection.serialize(),
		});
	}
}
