import { CollectionService } from '#services/collections/collection_service';
import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';
import vine from '@vinejs/vine';

@inject()
export default class UnfollowCollectionController {
	private readonly collectionIdValidator = vine.create(
		vine.object({
			params: vine.object({
				id: vine.number().positive(),
			}),
		})
	);

	constructor(protected readonly collectionService: CollectionService) {}

	async execute({ request, response, auth }: HttpContext) {
		const {
			params: { id: collectionId },
		} = await request.validateUsing(this.collectionIdValidator);

		const userId = auth.getUserOrFail().id;
		await this.collectionService.unfollowCollection(collectionId, userId);
		return response.redirect().back();
	}
}
