import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import LinkTransformer from '#transformers/link';
import { resolveRequestOrigin } from '#lib/request_origin';
import { LinkQueryService } from '#services/links/link_query_service';
import { DashboardSidebarService } from '#services/dashboard/dashboard_sidebar_service';

@inject()
export default class ShowFavoritesController {
	constructor(
		protected readonly dashboardSidebarService: DashboardSidebarService,
		protected readonly linkQueryService: LinkQueryService
	) {}

	async render({ auth, inertia, request }: HttpContext) {
		const userId = auth.getUserOrFail().id;
		const [sidebarProps, favoriteLinks] = await Promise.all([
			this.dashboardSidebarService.getProps(
				userId,
				resolveRequestOrigin({ request })
			),
			this.linkQueryService.getMyFavoriteLinks(userId),
		]);

		return inertia.render('dashboard', {
			...sidebarProps,
			favoriteLinks:
				LinkTransformer.transform(favoriteLinks).useVariant('withCollections'),
			activeCollection: null,
		});
	}
}
