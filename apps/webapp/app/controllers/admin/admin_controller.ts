import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import UserTransformer from '#transformers/user';
import { LinkService } from '#services/links/link_service';
import AuthController from '#controllers/auth/auth_controller';
import { CollectionService } from '#services/collections/collection_service';

@inject()
export default class AdminController {
	constructor(
		protected usersController: AuthController,
		protected collectionService: CollectionService,
		protected linkService: LinkService
	) {}

	async render({ inertia }: HttpContext) {
		const users = await this.usersController.getAllUsersWithTotalRelations();
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
