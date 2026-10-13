import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { CollectionOrderingService } from '#services/collections/collection_ordering_service';
import { reorderCollectionsValidator } from '#validators/collections/reorder_collections_validator';

@inject()
export default class ReorderOwnedCollectionsController {
	constructor(
		protected readonly collectionOrderingService: CollectionOrderingService
	) {}

	async execute({ request, auth, response }: HttpContext) {
		const { visibility, collectionIds } = await request.validateUsing(
			reorderCollectionsValidator
		);

		await this.collectionOrderingService.reorderOwnedCollections(
			auth.getUserOrFail().id,
			visibility,
			collectionIds
		);

		return response.json({ message: 'Collections reordered successfully' });
	}
}
