import { CollectionService } from '#services/collections/collection_service';
import { createCollectionValidator } from '#validators/collections/create_collection_validator';
import { inject } from '@adonisjs/core';
import { type HttpContext } from '@adonisjs/core/http';

@inject()
export default class CreateCollectionController {
	constructor(private collectionService: CollectionService) {}

	async execute({ request, response }: HttpContext) {
		const payload = await request.validateUsing(createCollectionValidator);
		await this.collectionService.createCollection({
			name: payload.name,
			description: payload.description,
			visibility: payload.visibility,
			icon: payload.icon ?? null,
		});
		return response.redirect().back();
	}
}
