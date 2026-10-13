import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { CollectionFollowerService } from '#services/collections/collection_follower_service';
import { reorderFollowedCollectionsValidator } from '#validators/collections/reorder_followed_collections_validator';

@inject()
export default class ReorderFollowedCollectionsController {
	constructor(
		protected readonly collectionFollowerService: CollectionFollowerService
	) {}

	async execute({ request, auth, response }: HttpContext) {
		const { collectionIds } = await request.validateUsing(
			reorderFollowedCollectionsValidator
		);

		await this.collectionFollowerService.reorderFollowedCollections(
			auth.getUserOrFail().id,
			collectionIds
		);

		return response.json({ message: 'Collections reordered successfully' });
	}
}
