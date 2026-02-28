import { CollectionService } from '#services/collections/collection_service';
import { deleteCollectionValidator } from '#validators/collections/delete_collection_validator';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export default class DeleteCollectionController {
	constructor(protected readonly collectionService: CollectionService) {}

	async execute({ request, response }: HttpContext) {
		const { params } = await request.validateUsing(deleteCollectionValidator);
		await this.collectionService.deleteCollection(params.id);
		return response.json({
			message: 'Collection deleted successfully',
		});
	}
}
