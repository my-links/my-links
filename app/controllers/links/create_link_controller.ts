import { CollectionDto } from '#dtos/collection';
import { CollectionService } from '#services/collections/collection_service';
import { LinkService } from '#services/links/link_service';
import { createLinkValidator } from '#validators/links/create_link_validator';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export default class CreateLinkController {
	constructor(
		private linkService: LinkService,
		private collectionsService: CollectionService
	) {}

	async render({ inertia }: HttpContext) {
		const collections =
			await this.collectionsService.getCollectionsForAuthenticatedUser();
		return inertia.render('links/create', {
			collections: CollectionDto.fromArray(collections),
		});
	}

	async execute({ request }: HttpContext) {
		const { collectionId, ...payload } =
			await request.validateUsing(createLinkValidator);

		await this.linkService.createLink({
			...payload,
			collectionId,
		});
		return this.collectionsService.redirectToCollectionId(collectionId);
	}
}
