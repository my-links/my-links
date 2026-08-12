import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { CollectionService } from '#services/collections/collection_service';
import { reorderFollowedCollectionsAction } from '#controllers/collections/actions/reorder_followed_collections_action';

@inject()
export default class ReorderFollowedCollectionsController {
	constructor(protected readonly collectionService: CollectionService) {}

	async execute(ctx: HttpContext) {
		await reorderFollowedCollectionsAction(ctx, this.collectionService);

		return ctx.response.json({ message: 'Collections reordered successfully' });
	}
}
