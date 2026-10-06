import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { CollectionOrderingService } from '#services/collections/collection_ordering_service';
import { reorderOwnedCollectionsAction } from '#controllers/collections/actions/reorder_owned_collections_action';

@inject()
export default class ReorderOwnedCollectionsController {
	constructor(
		protected readonly collectionOrderingService: CollectionOrderingService
	) {}

	async execute(ctx: HttpContext) {
		await reorderOwnedCollectionsAction(ctx, this.collectionOrderingService);

		return ctx.response.redirect().back();
	}
}
