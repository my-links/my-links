import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { collectionIdValidator } from '#validators/collections/collection_id_validator';
import { CollectionFollowerService } from '#services/collections/collection_follower_service';

@inject()
export default class UnfollowCollectionController {
	constructor(
		protected readonly collectionFollowerService: CollectionFollowerService
	) {}

	async execute({ request, response, auth }: HttpContext) {
		const {
			params: { id: collectionId },
		} = await request.validateUsing(collectionIdValidator);

		const userId = auth.getUserOrFail().id;
		await this.collectionFollowerService.unfollowCollection(
			collectionId,
			userId
		);
		return response.redirect().back();
	}
}
