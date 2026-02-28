import { CollectionService } from '#services/collections/collection_service';
import { LinkService } from '#services/links/link_service';
import { updateLinkValidator } from '#validators/links/update_link_validator';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export default class UpdateLinkController {
	constructor(
		protected readonly linkService: LinkService,
		protected readonly collectionsService: CollectionService
	) {}

	async execute({ request }: HttpContext) {
		const {
			params: { id: linkId },
			...payload
		} = await request.validateUsing(updateLinkValidator);

		await this.linkService.updateLink(linkId, payload);
		return this.collectionsService.redirectToCollectionId(payload.collectionId);
	}
}
