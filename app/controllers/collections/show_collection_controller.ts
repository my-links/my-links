import { CollectionDto } from '#dtos/collection';
import { CollectionWithLinksDto } from '#dtos/collection_with_links';
import { CollectionService } from '#services/collections/collection_service';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';
import vine from '@vinejs/vine';

@inject()
export default class ShowCollectionController {
	private collectionIdValidator = vine.create(
		vine.object({
			params: vine.object({
				id: vine.number().positive(),
			}),
		})
	);

	constructor(private collectionService: CollectionService) {}

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

		const activeCollectionDto = new CollectionWithLinksDto(
			accessibleCollectionResult.collection
		);
		activeCollectionDto.isOwner = accessibleCollectionResult.isOwner;

		return inertia.render('dashboard', {
			followedCollections: CollectionDto.fromArray(followedCollections),
			myPublicCollections: CollectionDto.fromArray(myPublicCollections),
			myPrivateCollections: CollectionDto.fromArray(myPrivateCollections),
			favoriteLinks: null,
			activeCollection: activeCollectionDto.serialize(),
		});
	}
}
