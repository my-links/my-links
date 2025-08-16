import AuthController from '#auth/controllers/auth_controller';
import { CollectionService } from '#collections/services/collection_service';
import LinksController from '#links/controllers/delete_link_controller';
import User from '#user/models/user';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

class UserWithRelationCountDto {
	constructor(private user: User) {}

	toJson = () => ({
		id: this.user.id,
		email: this.user.email,
		fullname: this.user.name,
		avatarUrl: this.user.avatarUrl,
		isAdmin: this.user.isAdmin,
		createdAt: this.user.createdAt.toString(),
		updatedAt: this.user.updatedAt.toString(),
		lastSeenAt:
			this.user.lastSeenAt?.toString() ?? this.user.updatedAt.toString(),
		linksCount: Number(this.user.$extras.totalLinks),
		collectionsCount: Number(this.user.$extras.totalCollections),
	});
}

@inject()
export default class AdminController {
	constructor(
		protected usersController: AuthController,
		protected linksController: LinksController,
		protected collectionService: CollectionService
	) {}

	async index({ inertia }: HttpContext) {
		const users = await this.usersController.getAllUsersWithTotalRelations();
		const linksCount = await this.linksController.getTotalLinksCount();
		const collectionsCount =
			await this.collectionService.getTotalCollectionsCount();

		return inertia.render('admin/dashboard', {
			users: users.map((user) => new UserWithRelationCountDto(user).toJson()),
			totalLinks: linksCount,
			totalCollections: collectionsCount,
		});
	}
}
