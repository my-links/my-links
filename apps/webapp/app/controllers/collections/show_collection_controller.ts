import vine from '@vinejs/vine';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import CollectionTransformer from '#transformers/collection';
import { CollectionService } from '#services/collections/collection_service';

@inject()
export default class ShowCollectionController {
	private readonly collectionIdValidator = vine.create(
		vine.object({
			params: vine.object({
				id: vine.number().positive(),
			}),
		})
	);

	constructor(private readonly collectionService: CollectionService) {}

	async render({ request, inertia, auth }: HttpContext) {
		const {
			params: { id: collectionId },
		} = await request.validateUsing(this.collectionIdValidator);

		const userId = auth.getUserOrFail().id;
		const [
			followedCollections,
			myPublicCollections,
			myPrivateCollections,
			inboxCollection,
			accessibleCollectionResult,
		] = await Promise.all([
			this.collectionService.getFollowedCollections(userId),
			this.collectionService.getMyPublicCollections(userId),
			this.collectionService.getMyPrivateCollections(userId),
			this.collectionService.getOrCreateDefaultCollection(userId),
			this.collectionService.getAccessibleCollectionByIdWithLinks(
				collectionId,
				userId
			),
		]);

		return inertia.render('dashboard', {
			followedCollections: CollectionTransformer.transform(followedCollections),
			myPublicCollections: CollectionTransformer.transform(myPublicCollections),
			myPrivateCollections:
				CollectionTransformer.transform(myPrivateCollections),
			inboxCollection: CollectionTransformer.transform(inboxCollection),
			favoriteLinks: null,
			activeCollection: CollectionTransformer.transform(
				accessibleCollectionResult.collection
			).useVariant('withLinks'),
		});
	}
}
