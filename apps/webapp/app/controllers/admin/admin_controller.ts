import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import UserTransformer from '#transformers/user';
import { UserService } from '#services/user/user_service';
import { LinkService } from '#services/links/link_service';
import { CollectionService } from '#services/collections/collection_service';

@inject()
export default class AdminController {
	constructor(
		protected userService: UserService,
		protected collectionService: CollectionService,
		protected linkService: LinkService
	) {}

	async render({ inertia }: HttpContext) {
		const users = await this.userService.getAccountsOverview();
		const linksCount = await this.linkService.getTotalLinksCount();
		const collectionsCount =
			await this.collectionService.getTotalCollectionsCount();

		return inertia.render('admin/dashboard', {
			users: UserTransformer.transform(users).useVariant('withCounters'),
			totalLinks: linksCount,
			totalCollections: collectionsCount,
		});
	}
}
