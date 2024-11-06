import CollectionsController from '#controllers/collections_controller';
import LinksController from '#controllers/links_controller';
import UsersController from '#controllers/users_controller';
import User from '#models/user';
import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

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
		protected usersController: UsersController,
		protected linksController: LinksController,
		protected collectionsController: CollectionsController
	) {}

	async index({ response }: HttpContext) {
		const users = await this.usersController.getAllUsersWithTotalRelations();
		const linksCount = await this.linksController.getTotalLinksCount();
		const collectionsCount =
			await this.collectionsController.getTotalCollectionsCount();

		// TODO: return view
		return response.json({
			users: users.map((user) => new UserWithRelationCountDto(user).toJson()),
			totalLinks: linksCount,
			totalCollections: collectionsCount,
		});
		// return inertia.render('admin/dashboard', {
		// 	users: users.map((user) => new UserWithRelationCountDto(user).toJson()),
		// 	totalLinks: linksCount,
		// 	totalCollections: collectionsCount,
		// });
	}
}
