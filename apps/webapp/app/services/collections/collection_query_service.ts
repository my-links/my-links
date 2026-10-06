import { inject } from '@adonisjs/core';
import db from '@adonisjs/lucid/services/db';

import type User from '#models/user';
import Collection from '#models/collection';
import { VISIBILITY } from '#enums/collections/visibility';

@inject()
export class CollectionQueryService {
	async getAccessibleCollectionByIdWithLinks(
		id: Collection['id'],
		userId: User['id']
	) {
		const collection = await Collection.query()
			.where('id', id)
			.where((query) => {
				query.where('author_id', userId).orWhere((subQuery) => {
					subQuery
						.where('visibility', VISIBILITY.PUBLIC)
						.whereHas('followers', (followerQuery) => {
							followerQuery.where('users.id', userId);
						});
				});
			})
			.preload('links', (q) => {
				q.apply((scopes) => scopes.orderedInCollection()).preload(
					'collections'
				);
			})
			.preload('author')
			.withCount('followers', (query) => {
				query.as('followersCount');
			})
			.firstOrFail();

		return {
			collection,
			isOwner: collection.authorId === userId,
		};
	}

	/**
	 * Backs `GET /api/v1/collections` (the extension). Collections and links
	 * are each ordered within their own `position` scope, same as the sidebar
	 * — `position` is scoped `(author_id, visibility)` for collections and
	 * `(collection_id)` for the pivot, so this cannot produce one merged
	 * global order, only two internally-consistent ones. The client sorts
	 * public/private into their own sections using `visibility`, already on
	 * every collection.
	 */
	async getCollectionsForAuthenticatedUser(userId: User['id']) {
		return await Collection.query()
			.where('author_id', userId)
			.orderBy('position', 'asc')
			.orderBy('name', 'asc')
			.preload('links', (q) => {
				q.apply((scopes) => scopes.orderedInCollection()).preload(
					'collections'
				);
			});
	}

	async getTotalCollectionsCount() {
		const totalCount = await db.from('collections').count('* as total');
		return Number(totalCount[0].total);
	}

	getPublicCollectionById(id: Collection['id']) {
		return Collection.query()
			.where('id', id)
			.andWhere('visibility', VISIBILITY.PUBLIC)
			.preload('links', (q) => {
				q.apply((scopes) => scopes.orderedInCollection()).preload(
					'collections'
				);
			})
			.preload('author')
			.withCount('followers', (query) => {
				query.as('followersCount');
			})
			.orderBy('name', 'asc')
			.firstOrFail();
	}

	async getMyPublicCollections(userId: User['id']) {
		return await Collection.query()
			.where('author_id', userId)
			.andWhere('visibility', VISIBILITY.PUBLIC)
			.withCount('links', (query) => {
				query.as('linksCount');
			})
			.orderBy('position', 'asc')
			.orderBy('name', 'asc');
	}

	/**
	 * The Inbox is deliberately absent: the sidebar pins it on its own, above
	 * the sections the user orders. `getDefaultCollection` serves it instead.
	 */
	async getMyPrivateCollections(userId: User['id']) {
		return await Collection.query()
			.where('author_id', userId)
			.andWhere('visibility', VISIBILITY.PRIVATE)
			.andWhere('is_default', false)
			.withCount('links', (query) => {
				query.as('linksCount');
			})
			.orderBy('position', 'asc')
			.orderBy('name', 'asc');
	}
}
