import { Visibility } from '#enums/collections/visibility';
import Collection from '#models/collection';
import User from '#models/user';
import { collectionIdValidator } from '#validators/collections/collection_id_validator';
import { HttpContext } from '@adonisjs/core/http';
import db from '@adonisjs/lucid/services/db';

type CreateCollectionPayload = {
	name: string;
	description: string | null;
	visibility: Visibility;
	icon: string | null;
};

type UpdateCollectionPayload = CreateCollectionPayload;

export class CollectionService {
	async getCollectionById(id: Collection['id']) {
		const context = this.getAuthContext();
		return await Collection.query()
			.where('id', id)
			.andWhere('author_id', context.auth.user!.id)
			.firstOrFail();
	}

	async getCollectionByIdWithLinks(id: Collection['id']) {
		const context = this.getAuthContext();
		return await Collection.query()
			.where('id', id)
			.andWhere('author_id', context.auth.user!.id)
			.preload('links', (q) => q.orderBy('favorite', 'desc'))
			.firstOrFail();
	}

	async getAccessibleCollectionByIdWithLinks(
		id: Collection['id'],
		userId: User['id']
	) {
		const collection = await Collection.query()
			.where('id', id)
			.where((query) => {
				query.where('author_id', userId).orWhere((subQuery) => {
					subQuery
						.where('visibility', Visibility.PUBLIC)
						.whereHas('followers', (followerQuery) => {
							followerQuery.where('users.id', userId);
						});
				});
			})
			.preload('links', (q) => q.orderBy('favorite', 'desc'))
			.preload('author')
			.firstOrFail();

		return {
			collection,
			isOwner: collection.authorId === userId,
		};
	}

	async getFirstCollection() {
		const context = this.getAuthContext();
		return await Collection.query()
			.where('author_id', context.auth.user!.id)
			.orderBy('created_at', 'asc')
			.firstOrFail();
	}

	async getCollectionsForAuthenticatedUser() {
		const context = this.getAuthContext();
		return await Collection.query()
			.where('author_id', context.auth.user!.id)
			.orderBy('created_at', 'desc')
			.preload('links', (q) => q.orderBy('favorite', 'desc'));
	}

	async getTotalCollectionsCount() {
		const totalCount = await db.from('collections').count('* as total');
		return Number(totalCount[0].total);
	}

	createCollection(payload: CreateCollectionPayload) {
		const context = this.getAuthContext();
		return Collection.create({
			...payload,
			authorId: context.auth.user!.id,
		});
	}

	async updateCollection(
		id: Collection['id'],
		payload: UpdateCollectionPayload
	) {
		const context = this.getAuthContext();
		const collection = await Collection.query()
			.where('id', id)
			.andWhere('author_id', context.auth.user!.id)
			.firstOrFail();

		await Collection.query()
			.where('id', id)
			.andWhere('author_id', context.auth.user!.id)
			.update(payload);

		// If collection becomes private, remove all followers
		if (
			collection.visibility === Visibility.PUBLIC &&
			payload.visibility === Visibility.PRIVATE
		) {
			await this.removeAllFollowers(id);
		}

		return collection;
	}

	deleteCollection(id: Collection['id']) {
		const context = this.getAuthContext();
		return Collection.query()
			.where('id', id)
			.andWhere('author_id', context.auth.user!.id)
			.delete();
	}

	getPublicCollectionById(id: Collection['id']) {
		return Collection.query()
			.where('id', id)
			.andWhere('visibility', Visibility.PUBLIC)
			.preload('links')
			.preload('author')
			.firstOrFail();
	}

	async followCollection(collectionId: Collection['id'], userId: User['id']) {
		const collection = await Collection.query()
			.where('id', collectionId)
			.andWhere('visibility', Visibility.PUBLIC)
			.firstOrFail();

		const user = await User.findOrFail(userId);

		await collection.related('followers').attach([user.id]);
	}

	async unfollowCollection(collectionId: Collection['id'], userId: User['id']) {
		const collection = await Collection.findOrFail(collectionId);
		const user = await User.findOrFail(userId);

		await collection.related('followers').detach([user.id]);
	}

	async getFollowedCollections(userId: User['id']) {
		return await Collection.query()
			.whereHas('followers', (query) => {
				query.where('users.id', userId);
			})
			.andWhere('visibility', Visibility.PUBLIC)
			.preload('author')
			.orderBy('created_at', 'desc');
	}

	async getMyPublicCollections(userId: User['id']) {
		return await Collection.query()
			.where('author_id', userId)
			.andWhere('visibility', Visibility.PUBLIC)
			.orderBy('created_at', 'desc');
	}

	async getMyPrivateCollections(userId: User['id']) {
		return await Collection.query()
			.where('author_id', userId)
			.andWhere('visibility', Visibility.PRIVATE)
			.orderBy('created_at', 'desc');
	}

	async isFollowingCollection(
		collectionId: Collection['id'],
		userId: User['id']
	): Promise<boolean> {
		const result = await db
			.from('collection_followers')
			.where('collection_id', collectionId)
			.where('user_id', userId)
			.first();
		return !!result;
	}

	private async removeAllFollowers(collectionId: Collection['id']) {
		await db
			.from('collection_followers')
			.where('collection_id', collectionId)
			.delete();
	}

	private getAuthContext() {
		const context = HttpContext.getOrFail();
		if (!context.auth.user || !context.auth.user.id) {
			throw new Error('User not authenticated');
		}
		return context;
	}

	async validateCollectionId(collectionIdRequired: boolean = true) {
		const ctx = HttpContext.getOrFail();
		const { collectionId } = await ctx.request.validateUsing(
			collectionIdValidator
		);
		if (!collectionId && collectionIdRequired) {
			this.redirectToFavoriteLinks();
			return null;
		}
		return collectionId;
	}

	redirectToCollectionId(collectionId: Collection['id']) {
		const ctx = HttpContext.getOrFail();
		return ctx.response.redirect().toRoute('collection.show', {
			id: collectionId,
		});
	}

	redirectToFavoriteLinks() {
		const ctx = HttpContext.getOrFail();
		return ctx.response.redirect().toRoute('collection.favorites');
	}
}
