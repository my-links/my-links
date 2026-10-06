import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import UserTransformer from '#transformers/user';
import { LinkQueryService } from '#services/links/link_query_service';
import { AccountQueryService } from '#services/user/account_query_service';
import { CollectionQueryService } from '#services/collections/collection_query_service';

@inject()
export default class ShowAdminDashboardController {
	constructor(
		protected accountQueryService: AccountQueryService,
		protected collectionQueryService: CollectionQueryService,
		protected linkQueryService: LinkQueryService
	) {}

	async render({ inertia }: HttpContext) {
		const users = await this.accountQueryService.getAccountsOverview();
		const linksCount = await this.linkQueryService.getTotalLinksCount();
		const collectionsCount =
			await this.collectionQueryService.getTotalCollectionsCount();

		return inertia.render('admin/dashboard', {
			users: UserTransformer.transform(users).useVariant('withCounters'),
			totalLinks: linksCount,
			totalCollections: collectionsCount,
		});
	}
}
