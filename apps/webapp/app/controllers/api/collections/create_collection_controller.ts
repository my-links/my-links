import { inject } from '@adonisjs/core';
import { type HttpContext } from '@adonisjs/core/http';

import CollectionTransformer from '#transformers/collection';
import { CollectionService } from '#services/collections/collection_service';
import { createCollectionAction } from '#controllers/collections/actions/create_collection_action';

@inject()
export default class CreateCollectionController {
	constructor(protected readonly collectionService: CollectionService) {}

	async execute(ctx: HttpContext) {
		const collection = await createCollectionAction(
			ctx,
			this.collectionService
		);

		const { data: serializedCollection } = await ctx.serialize(
			CollectionTransformer.transform(collection).useVariant('withOwnLinks')
		);
		return ctx.response.json({
			message: 'Collection created successfully',
			collection: serializedCollection,
		});
	}
}
