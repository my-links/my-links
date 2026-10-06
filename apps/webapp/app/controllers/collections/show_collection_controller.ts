import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { resolveRequestOrigin } from '#lib/request_origin';
import CollectionTransformer from '#transformers/collection';
import { CollectionQueryService } from '#services/collections/collection_query_service';
import { collectionIdValidator } from '#validators/collections/collection_id_validator';
import { DashboardSidebarService } from '#services/dashboard/dashboard_sidebar_service';

@inject()
export default class ShowCollectionController {
	constructor(
		private readonly collectionQueryService: CollectionQueryService,
		private readonly dashboardSidebarService: DashboardSidebarService
	) {}

	async render({ request, inertia, response, auth }: HttpContext) {
		const {
			params: { id: collectionId },
		} = await request.validateUsing(collectionIdValidator);

		const userId = auth.getUserOrFail().id;
		const [sidebarProps, accessibleCollectionResult] = await Promise.all([
			this.dashboardSidebarService.getProps(
				userId,
				resolveRequestOrigin({ request })
			),
			this.collectionQueryService.getAccessibleCollectionByIdWithLinks(
				collectionId,
				userId
			),
		]);

		const { collection, isOwner } = accessibleCollectionResult;

		// One canonical URL for the Inbox, so the id links pointing at it (and
		// any bookmark predating `collection.inbox`) land on the named route.
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
