import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import CollectionTransformer from '#transformers/collection';
import { CollectionService } from '#services/collections/collection_service';
import { DashboardSidebarService } from '#services/dashboard/dashboard_sidebar_service';

/**
 * The Inbox has a name rather than an id in its URL, like the favorites: it is
 * one fixed place per account, not one collection among the ones the user
 * made. `ShowCollectionController` redirects its id to here.
 */
@inject()
export default class ShowInboxController {
	constructor(
		private readonly collectionService: CollectionService,
		private readonly dashboardSidebarService: DashboardSidebarService
	) {}

	async render({ inertia, auth }: HttpContext) {
		const userId = auth.getUserOrFail().id;
		const inbox =
			await this.collectionService.getOrCreateDefaultCollection(userId);

		const [sidebarProps, accessibleCollectionResult] = await Promise.all([
			this.dashboardSidebarService.getProps(userId),
			this.collectionService.getAccessibleCollectionByIdWithLinks(
				inbox.id,
				userId
			),
		]);

		return inertia.render('dashboard', {
			...sidebarProps,
			favoriteLinks: null,
			activeCollection: CollectionTransformer.transform(
				accessibleCollectionResult.collection
			).useVariant('withLinks'),
		});
	}
}
