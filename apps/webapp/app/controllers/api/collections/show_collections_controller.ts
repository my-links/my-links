import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import CollectionTransformer from '#transformers/collection';
import { CollectionService } from '#services/collections/collection_service';
import { CollectionFollowerService } from '#services/collections/collection_follower_service';

@inject()
export default class ShowCollectionsController {
	constructor(
		protected readonly collectionService: CollectionService,
		protected readonly collectionFollowerService: CollectionFollowerService
	) {}

	async render({ auth, response, serialize }: HttpContext) {
		const userId = auth.getUserOrFail().id;
		const collections =
			await this.collectionService.getCollectionsForAuthenticatedUser(userId);
		const followedCollections =
			await this.collectionFollowerService.getFollowedCollectionsWithLinks(
				userId
			);

		const { data } = await serialize(
			CollectionTransformer.transform(collections).useVariant('withOwnLinks')
		);
		const followedData = await serialize.withoutWrapping(
			CollectionTransformer.transform(followedCollections).useVariant(
				'withLinks'
			)
		);

		return response.json({ data, followedCollections: followedData });
	}
}
