import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import Collection from '#models/collection';
import { CollectionLinkService } from '#services/collections/collection_link_service';
import { reorderCollectionLinksValidator } from '#validators/collections/reorder_collection_links_validator';

@inject()
export default class ReorderCollectionLinksController {
	constructor(
		protected readonly collectionLinkService: CollectionLinkService
	) {}

	async execute({ request, response, auth }: HttpContext) {
		const {
			params: { id: collectionId },
			linkIds,
		} = await request.validateUsing(reorderCollectionLinksValidator);

		const collection = await Collection.query()
			.where('id', collectionId)
			.andWhere('author_id', auth.getUserOrFail().id)
			.firstOrFail();

		await this.collectionLinkService.reorderLinksInCollection(
			collection,
			linkIds
		);
		return response.redirect().back();
	}
}
