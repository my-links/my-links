import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { CollectionService } from '#services/collections/collection_service';
import { reorderCollectionsValidator } from '#validators/collections/reorder_collections_validator';

@inject()
export default class ReorderOwnedCollectionsController {
	constructor(protected readonly collectionService: CollectionService) {}

	async execute({ request, response }: HttpContext) {
		const { visibility, collectionIds } = await request.validateUsing(
			reorderCollectionsValidator
		);

		await this.collectionService.reorderOwnedCollections(
			visibility,
			collectionIds
		);
		return response.redirect().back();
	}
}
