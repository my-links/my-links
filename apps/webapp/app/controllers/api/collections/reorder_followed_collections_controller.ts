import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { CollectionFollowerService } from '#services/collections/collection_follower_service';
import { reorderFollowedCollectionsAction } from '#controllers/collections/actions/reorder_followed_collections_action';

@inject()
export default class ReorderFollowedCollectionsController {
	constructor(
		protected readonly collectionFollowerService: CollectionFollowerService
	) {}

	async execute(ctx: HttpContext) {
		await reorderFollowedCollectionsAction(ctx, this.collectionFollowerService);

		return ctx.response.json({ message: 'Collections reordered successfully' });
	}
}
