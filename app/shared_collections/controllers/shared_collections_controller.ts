import { CollectionService } from '#collections/services/collection_service';
import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';
import { getSharedCollectionValidator } from '../validators/shared_collection.js';

@inject()
export default class SharedCollectionsController {
	constructor(private collectionService: CollectionService) {}

	async index({ request, inertia }: HttpContext) {
		const { params } = await request.validateUsing(
			getSharedCollectionValidator
		);

		const activeCollection =
			await this.collectionService.getPublicCollectionById(params.id);
		return inertia.render('shared', { activeCollection });
	}
}
