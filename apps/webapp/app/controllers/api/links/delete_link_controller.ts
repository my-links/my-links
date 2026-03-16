import { CollectionService } from '#services/collections/collection_service';
import { LinkService } from '#services/links/link_service';
import { deleteLinkValidator } from '#validators/links/delete_link_validator';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export default class DeleteLinkController {
	constructor(
		protected collectionsService: CollectionService,
		protected linkService: LinkService
	) {}

	async execute({ request, response }: HttpContext) {
		const { params } = await request.validateUsing(deleteLinkValidator);
		await this.linkService.deleteLink(params.id);
		return response.json({
			message: 'Link deleted successfully',
		});
	}
}
