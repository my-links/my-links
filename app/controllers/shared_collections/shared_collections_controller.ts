import { SharedCollectionDto } from '#dtos/shared_collection';
import { CollectionService } from '#services/collections/collection_service';
import { getSharedCollectionValidator } from '#validators/shared_collections/shared_collection';
import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

@inject()
export default class SharedCollectionsController {
	constructor(private collectionService: CollectionService) {}

	async render({ request, inertia, auth }: HttpContext) {
		const { params } = await request.validateUsing(
			getSharedCollectionValidator
		);

		const userId = auth.getUserOrFail().id;
		const [activeCollection, isFollowing] = await Promise.all([
			this.collectionService.getPublicCollectionById(params.id),
			this.collectionService.isFollowingCollection(params.id, userId),
		]);

		return inertia.render('shared', {
			activeCollection: new SharedCollectionDto(activeCollection).serialize(),
			isFollowing,
		});
	}
}
