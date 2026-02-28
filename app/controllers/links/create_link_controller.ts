import { CollectionService } from '#services/collections/collection_service';
import { LinkService } from '#services/links/link_service';
import { createLinkValidator } from '#validators/links/create_link_validator';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export default class CreateLinkController {
	constructor(
		protected readonly linkService: LinkService,
		protected readonly collectionsService: CollectionService
	) {}

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
