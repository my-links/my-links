import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { updateCollectionAction } from '#controllers/collections/actions/update_collection_action';
import { resolveRequestOrigin } from '#lib/request_origin';
import { CollectionService } from '#services/collections/collection_service';
import { updateCollectionValidator } from '#validators/collections/update_collection_validator';

@inject()
export default class UpdateCollectionController {
	constructor(protected readonly collectionService: CollectionService) {}

	async execute({ request, auth, response }: HttpContext) {
		const payload = await request.validateUsing(updateCollectionValidator);

		await updateCollectionAction(
			{
				payload,
				userId: auth.getUserOrFail().id,
				origin: resolveRequestOrigin({ request }),
			},
			this.collectionService
		);

		return response.json({ message: 'Collection updated successfully' });
	}
}
