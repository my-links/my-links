import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { CollectionService } from '#services/collections/collection_service';
import { updateCollectionAction } from '#controllers/collections/actions/update_collection_action';

@inject()
export default class UpdateCollectionController {
	constructor(protected readonly collectionService: CollectionService) {}

	async execute(ctx: HttpContext) {
		await updateCollectionAction(ctx, this.collectionService);

		return ctx.response.json({
			message: 'Collection updated successfully',
		});
	}
}
