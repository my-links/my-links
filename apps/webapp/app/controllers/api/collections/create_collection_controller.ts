import { inject } from '@adonisjs/core';
import { type HttpContext } from '@adonisjs/core/http';

import CollectionTransformer from '#transformers/collection';
import { CollectionService } from '#services/collections/collection_service';
import { createCollectionValidator } from '#validators/collections/create_collection_validator';

@inject()
export default class CreateCollectionController {
	constructor(protected readonly collectionService: CollectionService) {}

	async execute({ request, response, serialize }: HttpContext) {
		const payload = await request.validateUsing(createCollectionValidator);
		const collection = await this.collectionService.createCollection({
			name: payload.name,
			description: payload.description,
			visibility: payload.visibility,
			icon: payload.icon ?? null,
		});
		const { data: serializedCollection } = await serialize(
			CollectionTransformer.transform(collection).useVariant('withLinks')
		);
		return response.json({
			message: 'Collection created successfully',
			collection: serializedCollection,
		});
	}
}
