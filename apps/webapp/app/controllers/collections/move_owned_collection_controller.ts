import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { resolveRequestOrigin } from '#lib/request_origin';
import { CollectionService } from '#services/collections/collection_service';
import { moveOwnedCollectionValidator } from '#validators/collections/move_owned_collection_validator';

@inject()
export default class MoveOwnedCollectionController {
	constructor(protected readonly collectionService: CollectionService) {}

	async execute({ request, auth, response }: HttpContext) {
		const {
			visibility,
			collectionIds,
			params: { id: collectionId },
		} = await request.validateUsing(moveOwnedCollectionValidator);

		await this.collectionService.moveOwnedCollectionToSection(
			auth.getUserOrFail().id,
			collectionId,
			visibility,
			collectionIds,
			resolveRequestOrigin({ request })
		);

		return response.redirect().back();
	}
}
