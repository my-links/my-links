import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { CollectionService } from '#services/collections/collection_service';
import { reorderOwnedCollectionsAction } from '#controllers/collections/actions/reorder_owned_collections_action';

@inject()
export default class ReorderOwnedCollectionsController {
	constructor(protected readonly collectionService: CollectionService) {}

	async execute(ctx: HttpContext) {
		await reorderOwnedCollectionsAction(ctx, this.collectionService);

		return ctx.response.json({ message: 'Collections reordered successfully' });
	}
}
