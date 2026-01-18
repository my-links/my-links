import { Visibility } from '#enums/collections/visibility';
import Collection from '#models/collection';
import User from '#models/user';
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
			.preload('links', (q) => q.orderBy('created_at', 'desc'))
			.preload('author')
			.firstOrFail();

		return {
			collection,
			isOwner: collection.authorId === userId,
		};
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
			.orderBy('created_at', 'desc')
			.delete();
	}

	getPublicCollectionById(id: Collection['id']) {
		return Collection.query()
			.where('id', id)
			.andWhere('visibility', Visibility.PUBLIC)
			.preload('links', (q) => q.orderBy('created_at', 'desc'))
			.preload('author')
			.orderBy('created_at', 'desc')
			.firstOrFail();
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

	async getFollowedCollections(userId: User['id']) {
		return await Collection.query()
			.whereHas('followers', (query) => {
				query.where('users.id', userId);
			})
			.andWhere('visibility', Visibility.PUBLIC)
			.preload('author')
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

	async removeAllFollowers(collectionId: Collection['id']) {
		await db
			.from('collection_followers')
			.where('collection_id', collectionId)
			.delete();
	}

	redirectToCollectionId(collectionId: Collection['id']) {
		const context = this.getAuthContext();
		return context.response.redirect().toRoute('collection.show', {
			id: collectionId,
		});
	}

	private getAuthContext() {
		const context = HttpContext.getOrFail();
		if (!context.auth.user || !context.auth.user.id) {
			throw new Error('User not authenticated');
		}
		return context;
	}
}
