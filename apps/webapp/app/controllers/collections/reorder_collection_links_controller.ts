import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { CollectionLinkService } from '#services/collections/collection_link_service';
import { reorderCollectionLinksValidator } from '#validators/collections/reorder_collection_links_validator';
import { reorderCollectionLinksAction } from '#controllers/collections/actions/reorder_collection_links_action';

@inject()
export default class ReorderCollectionLinksController {
	constructor(
		protected readonly collectionLinkService: CollectionLinkService
	) {}

	async execute({ request, auth, response }: HttpContext) {
		const payload = await request.validateUsing(
			reorderCollectionLinksValidator
		);

		await reorderCollectionLinksAction(
			{ payload, userId: auth.getUserOrFail().id },
			this.collectionLinkService
		);

		return response.redirect().back();
	}
}
