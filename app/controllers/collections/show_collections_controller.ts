import { CollectionDto } from '#dtos/collection';
import { LinkDto } from '#dtos/link';
import { CollectionService } from '#services/collections/collection_service';
import { LinkService } from '#services/links/link_service';
import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

@inject()
export default class ShowCollectionsController {
	constructor(
		private collectionService: CollectionService,
		private linkService: LinkService
	) {}

	// Dashboard
	async render({ inertia, response }: HttpContext) {
		const activeCollectionId =
			await this.collectionService.validateCollectionId(false);
		const [collections, favoriteLinks] = await Promise.all([
			this.collectionService.getCollectionsForAuthenticatedUser(),
			this.linkService.getFavoriteLinksForAuthenticatedUser(),
		]);

		const activeCollection = collections.find(
			(c) => c.id === activeCollectionId
		);

		if (!activeCollection && !!activeCollectionId) {
			return response.redirectToNamedRoute('dashboard');
		}

		return inertia.render('dashboard', {
			collections: CollectionDto.fromArray(collections),
			favoriteLinks: LinkDto.fromArray(favoriteLinks),
			activeCollection: activeCollection
				? new CollectionDto(activeCollection).serialize()
				: null,
		});
	}
}
