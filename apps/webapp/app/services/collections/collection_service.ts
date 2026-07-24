import db from '@adonisjs/lucid/services/db';
import { HttpContext } from '@adonisjs/core/http';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';

import User from '#models/user';
import Collection from '#models/collection';
import { Visibility } from '#enums/collections/visibility';
import CannotDeleteDefaultCollectionException from '#exceptions/collections/cannot_delete_default_collection_exception';

const DEFAULT_COLLECTION_NAME = 'Inbox';

type CollectionPayload = {
	name: string;
	description: string | null;
	visibility: Visibility;
	icon: string | null;
};

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
			.preload('links', (q) => {
				q.orderBy('name', 'asc').preload('collections');
			})
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
			.where('author_id', context.auth.getUserOrFail().id)
			.orderBy('name', 'asc')
			.preload('links', (q) => {
				q.orderBy('favorite', 'desc').preload('collections');
			});
	}

	async getTotalCollectionsCount() {
		const totalCount = await db.from('collections').count('* as total');
		return Number(totalCount[0].total);
	}

	createCollection(payload: CollectionPayload) {
		const context = this.getAuthContext();
		return Collection.create({
			...payload,
			authorId: context.auth.getUserOrFail().id,
		});
	}

	async updateCollection(id: Collection['id'], payload: CollectionPayload) {
		const context = this.getAuthContext();
		const collection = await Collection.query()
			.where('id', id)
			.andWhere('author_id', context.auth.getUserOrFail().id)
			.firstOrFail();

		await Collection.query()
			.where('id', id)
			.andWhere('author_id', context.auth.getUserOrFail().id)
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

	async deleteCollection(id: Collection['id']) {
		const context = this.getAuthContext();
		const userId = context.auth.getUserOrFail().id;
		const collection = await Collection.query()
			.where('id', id)
			.andWhere('author_id', userId)
			.preload('links', (linksQuery) => {
				linksQuery.preload('collections');
			})
			.firstOrFail();

		if (collection.isDefault) {
			throw new CannotDeleteDefaultCollectionException(
				'The default collection cannot be deleted'
			);
		}

		const orphanedLinkIds = collection.links
			.filter((link) => link.collections.length === 1)
			.map((link) => link.id);

		return db.transaction(async (transaction) => {
			if (orphanedLinkIds.length > 0) {
				const defaultCollection =
					await this.getOrCreateDefaultCollection(userId);
				await defaultCollection
					.related('links')
					.attach(orphanedLinkIds, transaction);
			}

			await Collection.query({ client: transaction })
				.where('id', id)
				.andWhere('author_id', userId)
				.delete();
		});
	}

	async getOrCreateDefaultCollection(
		userId: User['id'],
		client?: TransactionClientContract
	): Promise<Collection> {
		const existingDefaultCollection = await Collection.query({ client })
			.where('author_id', userId)
			.andWhere('is_default', true)
			.first();

		if (existingDefaultCollection) {
			return existingDefaultCollection;
		}

		return await Collection.create(
			{
				name: DEFAULT_COLLECTION_NAME,
				description: null,
				visibility: Visibility.PRIVATE,
				icon: null,
				authorId: userId,
				isDefault: true,
			},
			{ client }
		);
	}

	getPublicCollectionById(id: Collection['id']) {
		return Collection.query()
			.where('id', id)
			.andWhere('visibility', Visibility.PUBLIC)
			.preload('links', (q) => {
				q.orderBy('name', 'asc').preload('collections');
			})
			.preload('author')
			.orderBy('name', 'asc')
			.firstOrFail();
	}

	async getMyPublicCollections(userId: User['id']) {
		return await Collection.query()
			.where('author_id', userId)
			.andWhere('visibility', Visibility.PUBLIC)
			.orderBy('name', 'asc');
	}

	async getMyPrivateCollections(userId: User['id']) {
		return await Collection.query()
			.where('author_id', userId)
			.andWhere('visibility', Visibility.PRIVATE)
			.orderBy('name', 'asc');
	}

	async getFollowedCollections(userId: User['id']) {
		return await Collection.query()
			.whereHas('followers', (query) => {
				query.where('users.id', userId);
			})
			.andWhere('visibility', Visibility.PUBLIC)
			.preload('author')
			.orderBy('name', 'asc');
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
		return HttpContext.getOrFail();
	}
}
