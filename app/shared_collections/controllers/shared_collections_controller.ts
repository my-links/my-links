import { Visibility } from '#collections/enums/visibility';
import Collection from '#collections/models/collection';
import Link from '#links/models/link';
import User from '#user/models/user';
import type { HttpContext } from '@adonisjs/core/http';
import { getSharedCollectionValidator } from '../validators/shared_collection.js';

class LinkWithoutFavoriteDto {
	constructor(private link: Link) {}

	toJson = () => ({
		id: this.link.id,
		name: this.link.name,
		description: this.link.description,
		url: this.link.url,
		collectionId: this.link.collectionId,
		createdAt: this.link.createdAt.toString(),
		updatedAt: this.link.updatedAt.toString(),
	});
}

class UserWithoutEmailDto {
	constructor(private user: User) {}

	toJson = () => ({
		id: this.user.id,
		fullname: this.user.name,
		avatarUrl: this.user.avatarUrl,
		isAdmin: this.user.isAdmin,
		createdAt: this.user.createdAt.toString(),
		updatedAt: this.user.updatedAt.toString(),
	});
}

export default class SharedCollectionsController {
	async index({ request, inertia }: HttpContext) {
		const { params } = await request.validateUsing(
			getSharedCollectionValidator
		);

		const collection = await this.getSharedCollectionById(params.id);
		return inertia.render('shared', { collection });
	}

	private async getSharedCollectionById(id: Collection['id']) {
		const collection = await Collection.query()
			.where('id', id)
			.andWhere('visibility', Visibility.PUBLIC)
			.preload('links')
			.preload('author')
			.firstOrFail();

		return {
			...collection.serialize(),
			links: collection.links.map((link) =>
				new LinkWithoutFavoriteDto(link).toJson()
			),
			author: new UserWithoutEmailDto(collection.author).toJson(),
		};
	}
}
