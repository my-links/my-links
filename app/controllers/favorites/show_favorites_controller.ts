import { CollectionService } from '#services/collections/collection_service';
import { LinkService } from '#services/links/link_service';
import CollectionTransformer from '#transformers/collection';
import LinkTransformer from '#transformers/link';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export default class ShowFavoritesController {
	constructor(
		protected readonly collectionService: CollectionService,
		protected readonly linkService: LinkService
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
			followedCollections: CollectionTransformer.transform(followedCollections),
			myPublicCollections: CollectionTransformer.transform(myPublicCollections),
			myPrivateCollections:
				CollectionTransformer.transform(myPrivateCollections),
			favoriteLinks: LinkTransformer.transform(favoriteLinks),
			activeCollection: null,
		});
	}
}
