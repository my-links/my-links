import AuthController from '#controllers/auth/auth_controller';
import LinksController from '#controllers/links/delete_link_controller';
import User from '#models/user';
import { CollectionService } from '#services/collections/collection_service';
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

	async render({ inertia }: HttpContext) {
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
