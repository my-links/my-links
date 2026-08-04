import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { CollectionService } from '#services/collections/collection_service';
import { reorderFollowedCollectionsValidator } from '#validators/collections/reorder_followed_collections_validator';

@inject()
export default class ReorderFollowedCollectionsController {
	constructor(protected readonly collectionService: CollectionService) {}

	async execute({ request, response }: HttpContext) {
		const { collectionIds } = await request.validateUsing(
			reorderFollowedCollectionsValidator
		);

		await this.collectionService.reorderFollowedCollections(collectionIds);
		return response.redirect().back();
	}
}
