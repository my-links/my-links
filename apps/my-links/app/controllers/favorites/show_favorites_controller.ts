import { CollectionDto } from '#dtos/collection';
import { LinkDto } from '#dtos/link';
import { CollectionService } from '#services/collections/collection_service';
import { LinkService } from '#services/links/link_service';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export default class ShowFavoritesController {
	constructor(
		private collectionService: CollectionService,
		private linkService: LinkService
	) {}

	async render({ auth, inertia }: HttpContext) {
		const userId = auth.user!.id;
		const [
			followedCollections,
			myPublicCollections,
			myPrivateCollections,
			favoriteLinks,
		] = await Promise.all([
			this.collectionService.getFollowedCollections(userId),
			this.collectionService.getMyPublicCollections(userId),
			this.collectionService.getMyPrivateCollections(userId),
			this.linkService.getMyFavoriteLinks(),
		]);

		return inertia.render('dashboard', {
			followedCollections: CollectionDto.fromArray(followedCollections),
			myPublicCollections: CollectionDto.fromArray(myPublicCollections),
			myPrivateCollections: CollectionDto.fromArray(myPrivateCollections),
			favoriteLinks: LinkDto.fromArray(favoriteLinks),
			activeCollection: null,
		});
	}
}
