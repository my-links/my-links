import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import CollectionTransformer from '#transformers/collection';
import { CollectionService } from '#services/collections/collection_service';

@inject()
export default class GetCollectionsController {
	constructor(protected readonly collectionService: CollectionService) {}

	async render({ auth, response, serialize }: HttpContext) {
		const collections =
			await this.collectionService.getCollectionsForAuthenticatedUser();
		const followedCollections =
			await this.collectionService.getFollowedCollectionsWithLinks(
				auth.getUserOrFail().id
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
