import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { CollectionService } from '#services/collections/collection_service';
import { collectionIdValidator } from '#validators/collections/collection_id_validator';

@inject()
export default class FollowCollectionController {
	constructor(protected readonly collectionService: CollectionService) {}

	async execute({ request, response, auth }: HttpContext) {
		const {
			params: { id: collectionId },
		} = await request.validateUsing(collectionIdValidator);
		await this.collectionService.followCollection(
			collectionId,
			auth.getUserOrFail().id
		);
		return response.redirect().back();
	}
}
