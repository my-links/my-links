import { SharedCollectionDto } from '#dtos/shared_collection';
import { CollectionService } from '#services/collections/collection_service';
import { getSharedCollectionValidator } from '#validators/shared_collections/shared_collection';
import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

@inject()
export default class SharedCollectionsController {
	constructor(private collectionService: CollectionService) {}

	async render({ request, inertia }: HttpContext) {
		const { params } = await request.validateUsing(
			getSharedCollectionValidator
		);

		const activeCollection =
			await this.collectionService.getPublicCollectionById(params.id);
		return inertia.render('shared', {
			activeCollection: new SharedCollectionDto(activeCollection).serialize(),
		});
	}
}
