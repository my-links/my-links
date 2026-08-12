import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { CollectionLinkService } from '#services/collections/collection_link_service';
import { addLinkToCollectionAction } from '#controllers/links/actions/add_link_to_collection_action';

@inject()
export default class AddLinkToCollectionController {
	constructor(
		protected readonly collectionLinkService: CollectionLinkService
	) {}

	async execute(ctx: HttpContext) {
		await addLinkToCollectionAction(ctx, this.collectionLinkService);

		return ctx.response.redirect().back();
	}
}
