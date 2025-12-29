import { CollectionWithLinksDto } from '#dtos/collection_with_links';
import { LinkDto } from '#dtos/link';
import { CollectionService } from '#services/collections/collection_service';
import { LinkService } from '#services/links/link_service';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';
import vine from '@vinejs/vine';

@inject()
export default class ShowCollectionController {
	private collectionIdValidator = vine.create(
		vine.object({
			params: vine.object({
				id: vine.number().positive().optional(),
			}),
		})
	);

	constructor(
		private collectionService: CollectionService,
		private linkService: LinkService
	) {}

	async render({ request, response, inertia }: HttpContext) {
		const {
			params: { id: collectionId },
		} = await request.validateUsing(this.collectionIdValidator);

		if (!collectionId) {
			console.log(collectionId);
			const firstCollection = await this.collectionService.getFirstCollection();
			return response.redirect().toRoute('collection.show', {
				id: firstCollection.id,
			});
		}

		const collections =
			await this.collectionService.getCollectionsForAuthenticatedUser();
		const favoriteLinks =
			await this.linkService.getFavoriteLinksForAuthenticatedUser();
		const collection =
			await this.collectionService.getCollectionByIdWithLinks(collectionId);
		return inertia.render('dashboard', {
			collections: CollectionWithLinksDto.fromArray(collections),
			favoriteLinks: LinkDto.fromArray(favoriteLinks),
			activeCollection: new CollectionWithLinksDto(collection).serialize(),
		});
	}
}
