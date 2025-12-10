import { CollectionService } from '#services/collections/collection_service';
import { LinkService } from '#services/links/link_service';
import { deleteLinkValidator } from '#validators/links/delete_link_validator';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';
import db from '@adonisjs/lucid/services/db';

@inject()
export default class DeleteLinkController {
	constructor(
		protected collectionsService: CollectionService,
		protected linkService: LinkService
	) {}

	async render({ auth, inertia, request }: HttpContext) {
		const linkId = request.qs()?.linkId;
		if (!linkId) {
			return this.collectionsService.redirectToDashboard();
		}

		const link = await this.linkService.getLinkById(linkId, auth.user!.id);
		await link.load('collection');
		return inertia.render('links/delete', { link });
	}

	async execute({ request, auth }: HttpContext) {
		const { params } = await request.validateUsing(deleteLinkValidator);

		const link = await this.linkService.getLinkById(params.id, auth.user!.id);
		await this.linkService.deleteLink(params.id);

		return this.collectionsService.redirectToCollectionId(link.collectionId);
	}

	async getTotalLinksCount() {
		const totalCount = await db.from('links').count('* as total');
		return Number(totalCount[0].total);
	}
}
