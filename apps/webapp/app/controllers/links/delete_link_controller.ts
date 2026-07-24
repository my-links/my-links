import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { LinkService } from '#services/links/link_service';
import { CollectionService } from '#services/collections/collection_service';
import { deleteLinkValidator } from '#validators/links/delete_link_validator';

@inject()
export default class DeleteLinkController {
	constructor(
		protected collectionsService: CollectionService,
		protected linkService: LinkService
	) {}

	async execute({ request, auth }: HttpContext) {
		const { params } = await request.validateUsing(deleteLinkValidator);

		const link = await this.linkService.getLinkById(
			params.id,
			auth.getUserOrFail().id
		);
		const [primaryCollection] = link.collections;
		await this.linkService.deleteLink(params.id);

		return this.collectionsService.redirectToCollectionId(primaryCollection.id);
	}
}
