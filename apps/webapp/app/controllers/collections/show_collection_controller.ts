import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import CollectionTransformer from '#transformers/collection';
import { CollectionService } from '#services/collections/collection_service';
import { collectionIdValidator } from '#validators/collections/collection_id_validator';
import { DashboardSidebarService } from '#services/dashboard/dashboard_sidebar_service';

@inject()
export default class ShowCollectionController {
	constructor(
		private readonly collectionService: CollectionService,
		private readonly dashboardSidebarService: DashboardSidebarService
	) {}

	async render({ request, inertia, response, auth }: HttpContext) {
		const {
			params: { id: collectionId },
		} = await request.validateUsing(collectionIdValidator);

		const userId = auth.getUserOrFail().id;
		const [sidebarProps, accessibleCollectionResult] = await Promise.all([
			this.dashboardSidebarService.getProps(userId),
			this.collectionService.getAccessibleCollectionByIdWithLinks(
				collectionId,
				userId
			),
		]);

		const { collection, isOwner } = accessibleCollectionResult;

		// One canonical URL for the Inbox, so the id links pointing at it — and
		// any bookmark predating `collection.inbox` — land on the named route.
		if (collection.isDefault && isOwner) {
			return response.redirect().toRoute('collection.inbox');
		}

		return inertia.render('dashboard', {
			...sidebarProps,
			favoriteLinks: null,
			activeCollection:
				CollectionTransformer.transform(collection).useVariant('withLinks'),
		});
	}
}
