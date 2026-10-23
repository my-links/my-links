import { inject } from '@adonisjs/core';
import { type HttpContext } from '@adonisjs/core/http';

import { createCollectionAction } from '#controllers/collections/actions/create_collection_action';
import { resolveRequestOrigin } from '#lib/request_origin';
import { CollectionService } from '#services/collections/collection_service';
import { createCollectionValidator } from '#validators/collections/create_collection_validator';

@inject()
export default class CreateCollectionController {
	constructor(protected readonly collectionService: CollectionService) {}

	async execute({ request, auth, response }: HttpContext) {
		const payload = await request.validateUsing(createCollectionValidator);

		await createCollectionAction(
			{
				payload,
				userId: auth.getUserOrFail().id,
				origin: resolveRequestOrigin({ request }),
			},
			this.collectionService
		);

		return response.redirect().back();
	}
}
