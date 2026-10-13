import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { resolveRequestOrigin } from '#lib/request_origin';
import { CollectionService } from '#services/collections/collection_service';
import { deleteCollectionValidator } from '#validators/collections/delete_collection_validator';

@inject()
export default class DeleteCollectionController {
	constructor(protected readonly collectionService: CollectionService) {}

	async execute({ request, auth, response }: HttpContext) {
		const { params } = await request.validateUsing(deleteCollectionValidator);

		await this.collectionService.deleteCollection(
			auth.getUserOrFail().id,
			params.id,
			resolveRequestOrigin({ request })
		);

		return response.redirect().back();
	}
}
