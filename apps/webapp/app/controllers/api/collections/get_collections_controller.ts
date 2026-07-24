import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import CollectionTransformer from '#transformers/collection';
import { CollectionService } from '#services/collections/collection_service';

@inject()
export default class GetCollectionsController {
	constructor(protected readonly collectionService: CollectionService) {}

	async render({ serialize }: HttpContext) {
		const collections =
			await this.collectionService.getCollectionsForAuthenticatedUser();
		return serialize(
			CollectionTransformer.transform(collections).useVariant('withOwnLinks')
		);
	}
}
