import { CollectionDto } from '#dtos/collection';
import { LinkDto } from '#dtos/link';
import { CollectionService } from '#services/collections/collection_service';
import { LinkService } from '#services/links/link_service';
import { updateLinkValidator } from '#validators/links/update_link_validator';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export default class UpdateLinkController {
	constructor(
		private linkService: LinkService,
		private collectionsService: CollectionService
	) {}

	async render({ auth, inertia, request, response }: HttpContext) {
		const linkId = request.qs()?.linkId;
		if (!linkId) {
			return response.redirectToNamedRoute('dashboard');
		}

		const collections =
			await this.collectionsService.getCollectionsForAuthenticatedUser();
		const link = await this.linkService.getLinkById(linkId, auth.user!.id);

		return inertia.render('links/edit', {
			collections: CollectionDto.fromArray(collections),
			link: new LinkDto(link).serialize(),
		});
	}

	async execute({ request }: HttpContext) {
		const { params, ...payload } =
			await request.validateUsing(updateLinkValidator);

		await this.linkService.updateLink(params.id, payload);
		return this.collectionsService.redirectToCollectionId(payload.collectionId);
	}
}
