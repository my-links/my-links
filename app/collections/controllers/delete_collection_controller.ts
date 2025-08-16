import { CollectionService } from '#collections/services/collection_service';
import { deleteCollectionValidator } from '#collections/validators/delete_collection_validator';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export default class DeleteCollectionController {
	constructor(private collectionService: CollectionService) {}

	async render({ inertia }: HttpContext) {
		const collectionId = await this.collectionService.validateCollectionId();
		if (!collectionId) return;

		const collection =
			await this.collectionService.getCollectionById(collectionId);
		return inertia.render('collections/delete', {
			collection,
		});
	}

	async execute({ request, response }: HttpContext) {
		const { params } = await request.validateUsing(deleteCollectionValidator);
		await this.collectionService.deleteCollection(params.id);
		return response.redirectToNamedRoute('dashboard');
	}
}
