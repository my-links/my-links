import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { CollectionService } from '#services/collections/collection_service';
import { deleteCollectionAction } from '#controllers/collections/actions/delete_collection_action';

@inject()
export default class DeleteCollectionController {
	constructor(protected readonly collectionService: CollectionService) {}

	async execute(ctx: HttpContext) {
		await deleteCollectionAction(ctx, this.collectionService);

		return ctx.response.redirect().back();
	}
}
