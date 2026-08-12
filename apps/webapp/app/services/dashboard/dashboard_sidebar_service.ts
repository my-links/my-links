import { inject } from '@adonisjs/core';

import type User from '#models/user';
import CollectionTransformer from '#transformers/collection';
import { CollectionService } from '#services/collections/collection_service';
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
		protected readonly collectionFollowerService: CollectionFollowerService
	) {}

	async getProps(userId: User['id']) {
		const [
			followedCollections,
			myPublicCollections,
			myPrivateCollections,
			inboxCollection,
		] = await Promise.all([
			this.collectionFollowerService.getFollowedCollections(userId),
			this.collectionService.getMyPublicCollections(userId),
			this.collectionService.getMyPrivateCollections(userId),
			this.collectionService.getOrCreateDefaultCollection(userId),
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
