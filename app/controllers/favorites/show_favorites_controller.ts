import { CollectionWithLinksDto } from '#dtos/collection_with_links';
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

	async render({ inertia }: HttpContext) {
		const collections =
			await this.collectionService.getCollectionsForAuthenticatedUser();
		const favoriteLinks =
			await this.linkService.getFavoriteLinksForAuthenticatedUser();

		return inertia.render('dashboard', {
			collections: CollectionWithLinksDto.fromArray(collections),
			favoriteLinks: LinkDto.fromArray(favoriteLinks),
			activeCollection: null,
		});
	}
}
