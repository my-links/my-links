import { inject } from '@adonisjs/core';

import type User from '#models/user';
import type { RequestOrigin } from '#lib/request_origin';
import CollectionTransformer from '#transformers/collection';
import { CollectionService } from '#services/collections/collection_service';
import { CollectionQueryService } from '#services/collections/collection_query_service';
import { CollectionFollowerService } from '#services/collections/collection_follower_service';

/**
 * The sidebar every dashboard route draws: the three ordered sections plus the
 * pinned Inbox. Shared, because those routes differ only by what they put in
 * the main pane.
 */
@inject()
export class DashboardSidebarService {
	constructor(
		protected readonly collectionService: CollectionService,
		protected readonly collectionQueryService: CollectionQueryService,
		protected readonly collectionFollowerService: CollectionFollowerService
	) {}

	async getProps(userId: User['id'], origin: RequestOrigin) {
		const [
			followedCollections,
			myPublicCollections,
			myPrivateCollections,
			inboxCollection,
		] = await Promise.all([
			this.collectionFollowerService.getFollowedCollections(userId),
			this.collectionQueryService.getMyPublicCollections(userId),
			this.collectionQueryService.getMyPrivateCollections(userId),
			this.collectionService.getOrCreateDefaultCollection(userId, origin),
		]);

		return {
			followedCollections: CollectionTransformer.transform(followedCollections),
			myPublicCollections: CollectionTransformer.transform(myPublicCollections),
			myPrivateCollections:
				CollectionTransformer.transform(myPrivateCollections),
			inboxCollection: CollectionTransformer.transform(inboxCollection),
		};
	}
}
