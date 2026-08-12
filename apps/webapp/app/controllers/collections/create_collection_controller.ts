import { inject } from '@adonisjs/core';
import { type HttpContext } from '@adonisjs/core/http';

import { CollectionService } from '#services/collections/collection_service';
import { createCollectionAction } from '#controllers/collections/actions/create_collection_action';

@inject()
export default class CreateCollectionController {
	constructor(protected readonly collectionService: CollectionService) {}

	async execute(ctx: HttpContext) {
		await createCollectionAction(ctx, this.collectionService);

		return ctx.response.redirect().back();
	}
}
