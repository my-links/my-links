import { CollectionService } from '#services/collections/collection_service';
import { updateCollectionValidator } from '#validators/collections/update_collection_validator';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export default class UpdateCollectionController {
	constructor(protected readonly collectionService: CollectionService) {}

	async execute({ request, response }: HttpContext) {
		const {
			params: { id: collectionId },
			...payload
		} = await request.validateUsing(updateCollectionValidator);

		await this.collectionService.updateCollection(collectionId, {
			name: payload.name,
			description: payload.description,
			visibility: payload.visibility,
			icon: payload.icon ?? null,
		});
		return response.json({
			message: 'Collection updated successfully',
		});
	}
}
