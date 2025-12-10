import AuthController from '#controllers/auth/auth_controller';
import LinksController from '#controllers/links/delete_link_controller';
import { UserWithCountersDto } from '#dtos/user_with_counters';
import { CollectionService } from '#services/collections/collection_service';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export default class AdminController {
	constructor(
		protected usersController: AuthController,
		protected linksController: LinksController,
		protected collectionService: CollectionService
	) {}

	async render({ inertia }: HttpContext) {
		const users = await this.usersController.getAllUsersWithTotalRelations();
		const linksCount = await this.linksController.getTotalLinksCount();
		const collectionsCount =
			await this.collectionService.getTotalCollectionsCount();

		return inertia.render('admin/dashboard', {
			users: UserWithCountersDto.fromArray(users),
			totalLinks: linksCount,
			totalCollections: collectionsCount,
		});
	}
}
