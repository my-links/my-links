import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { resolveRequestOrigin } from '#lib/request_origin';
import { collectionIdValidator } from '#validators/collections/collection_id_validator';
import { CollectionFollowerService } from '#services/collections/collection_follower_service';

@inject()
export default class FollowCollectionController {
	constructor(
		protected readonly collectionFollowerService: CollectionFollowerService
	) {}

	async execute({ request, response, auth }: HttpContext) {
		const {
			params: { id: collectionId },
		} = await request.validateUsing(collectionIdValidator);
		await this.collectionFollowerService.followCollection(
			collectionId,
			auth.getUserOrFail().id,
			resolveRequestOrigin({ request })
		);
		return response.redirect().back();
	}
}
