import { inject } from '@adonisjs/core';
import { type HttpContext } from '@adonisjs/core/http';

import { createCollectionAction } from '#controllers/collections/actions/create_collection_action';
import { resolveRequestOrigin } from '#lib/request_origin';
import { CollectionService } from '#services/collections/collection_service';
import CollectionTransformer from '#transformers/collection';
import { createCollectionValidator } from '#validators/collections/create_collection_validator';

@inject()
export default class CreateCollectionController {
	constructor(protected readonly collectionService: CollectionService) {}

	async execute(ctx: HttpContext) {
		const { request, auth, response } = ctx;
		const payload = await request.validateUsing(createCollectionValidator);

		const collection = await createCollectionAction(
			{
				payload,
				userId: auth.getUserOrFail().id,
				origin: resolveRequestOrigin({ request }),
			},
			this.collectionService
		);

		const { data: serializedCollection } = await ctx.serialize(
			CollectionTransformer.transform(collection).useVariant('withOwnLinks')
		);
		return response.json({
			message: 'Collection created successfully',
			collection: serializedCollection,
		});
	}
}
