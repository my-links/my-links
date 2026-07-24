import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { LinkService } from '#services/links/link_service';
import { CollectionService } from '#services/collections/collection_service';
import { createLinkValidator } from '#validators/links/create_link_validator';

@inject()
export default class CreateLinkController {
	constructor(
		protected readonly linkService: LinkService,
		protected readonly collectionsService: CollectionService
	) {}

	async execute({ request }: HttpContext) {
		const { collectionIds, ...payload } =
			await request.validateUsing(createLinkValidator);

		await this.linkService.createLink({
			...payload,
			collectionIds,
		});
		return this.collectionsService.redirectToCollectionId(collectionIds[0]);
	}
}
