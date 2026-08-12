import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import CollectionTransformer from '#transformers/collection';
import { CollectionService } from '#services/collections/collection_service';
import { CollectionFollowerService } from '#services/collections/collection_follower_service';
import { getSharedCollectionValidator } from '#validators/shared_collections/shared_collection';

@inject()
export default class SharedCollectionsController {
	constructor(
		protected readonly collectionService: CollectionService,
		protected readonly collectionFollowerService: CollectionFollowerService
	) {}

	async render({ request, inertia, auth }: HttpContext) {
		const { params } = await request.validateUsing(
			getSharedCollectionValidator
		);

		const userId = auth.user?.id;
		const [activeCollection, isFollowing] = await Promise.all([
			this.collectionService.getPublicCollectionById(params.id),
			userId
				? this.collectionFollowerService.isFollowingCollection(
						params.id,
						userId
					)
				: Promise.resolve(false),
		]);

		return inertia.render('shared', {
			activeCollection:
				CollectionTransformer.transform(activeCollection).useVariant(
					'withLinks'
				),
			isFollowing,
		});
	}
}
