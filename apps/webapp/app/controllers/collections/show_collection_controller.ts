import { CollectionService } from '#services/collections/collection_service';
import CollectionTransformer from '#transformers/collection';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';
import vine from '@vinejs/vine';

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

		const userId = auth.user!.id;
		const [
			followedCollections,
			myPublicCollections,
			myPrivateCollections,
			accessibleCollectionResult,
		] = await Promise.all([
			this.collectionService.getFollowedCollections(userId),
			this.collectionService.getMyPublicCollections(userId),
			this.collectionService.getMyPrivateCollections(userId),
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
			favoriteLinks: null,
			activeCollection: CollectionTransformer.transform(
				accessibleCollectionResult.collection
			).useVariant('withLinks'),
		});
	}
}
