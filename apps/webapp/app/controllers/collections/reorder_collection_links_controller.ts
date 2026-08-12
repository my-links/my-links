import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { CollectionLinkService } from '#services/collections/collection_link_service';
import { reorderCollectionLinksAction } from '#controllers/collections/actions/reorder_collection_links_action';

@inject()
export default class ReorderCollectionLinksController {
	constructor(
		protected readonly collectionLinkService: CollectionLinkService
	) {}

	async execute(ctx: HttpContext) {
		await reorderCollectionLinksAction(ctx, this.collectionLinkService);

		return ctx.response.redirect().back();
	}
}
