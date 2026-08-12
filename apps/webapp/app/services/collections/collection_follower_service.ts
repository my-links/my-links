import { inject } from '@adonisjs/core';
import db from '@adonisjs/lucid/services/db';
import { HttpContext } from '@adonisjs/core/http';

import User from '#models/user';
import { idSetsMatch } from '#lib/id_set';
import Collection from '#models/collection';
import { reorderByRank } from '#lib/reorder_by_rank';
import { AUDIT_SUBJECT_TYPE } from '#constants/audit';
import { ACTIVITY_EVENT_TYPE } from '#constants/activity';
import { VISIBILITY } from '#enums/collections/visibility';
import { ActivityEventService } from '#services/activity/activity_event_service';
import NotFollowingCollectionException from '#exceptions/collections/not_following_collection_exception';
import CannotFollowOwnCollectionException from '#exceptions/collections/cannot_follow_own_collection_exception';

/**
 * Owns the follower relationship on public collections — a separate concern
 * from ownership CRUD in `CollectionService`, with its own position scope
 * (`collection_followers`, keyed per follower) distinct from the owned
 * sections' `collections.position`.
 */
@inject()
export class CollectionFollowerService {
	constructor(protected readonly activityEventService: ActivityEventService) {}

	/**
	 * An explicit join, not `whereHas`, because the follower's position on
	 * `collection_followers` has to be readable for the `orderBy` below —
	 * an EXISTS subquery can't expose it.
	 */
	async getFollowedCollections(userId: User['id']) {
		return await Collection.query()
			.select('collections.*')
			.innerJoin(
				'collection_followers',
				'collection_followers.collection_id',
				'collections.id'
			)
			.where('collection_followers.user_id', userId)
			.andWhere('collections.visibility', VISIBILITY.PUBLIC)
			.preload('author')
			.orderBy('collection_followers.position', 'asc')
			.orderBy('collections.name', 'asc');
	}

	/**
	 * Same as `getFollowedCollections`, plus each collection's links —
	 * the extension renders a followed collection's contents directly on
	 * fetch, unlike the webapp sidebar which only loads links once a
	 * specific collection is opened.
	 */
	async getFollowedCollectionsWithLinks(userId: User['id']) {
		return await Collection.query()
			.select('collections.*')
			.innerJoin(
				'collection_followers',
				'collection_followers.collection_id',
				'collections.id'
			)
			.where('collection_followers.user_id', userId)
			.andWhere('collections.visibility', VISIBILITY.PUBLIC)
			.preload('author')
			.preload('links', (q) => {
				q.apply((scopes) => scopes.orderedInCollection());
			})
			.orderBy('collection_followers.position', 'asc')
			.orderBy('collections.name', 'asc');
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
			.andWhere('visibility', VISIBILITY.PUBLIC)
			.firstOrFail();

		if (collection.authorId === userId) {
			throw new CannotFollowOwnCollectionException(
				'A collection cannot be followed by its own author'
			);
		}

		const user = await User.findOrFail(userId);
		const position = await this.getNextFollowerPosition(userId);

		await collection.related('followers').attach({
			[user.id]: { position },
		});

		await this.activityEventService.record({
			type: ACTIVITY_EVENT_TYPE.COLLECTION_FOLLOWED,
			userId,
			subjectType: AUDIT_SUBJECT_TYPE.COLLECTION,
			subjectId: collectionId,
		});
	}

	async unfollowCollection(collectionId: Collection['id'], userId: User['id']) {
		const collection = await Collection.findOrFail(collectionId);
		const user = await User.findOrFail(userId);

		await collection.related('followers').detach([user.id]);

		await this.activityEventService.record({
			type: ACTIVITY_EVENT_TYPE.COLLECTION_UNFOLLOWED,
			userId,
			subjectType: AUDIT_SUBJECT_TYPE.COLLECTION,
			subjectId: collectionId,
		});
	}

	async removeAllFollowers(collectionId: Collection['id']) {
		await db
			.from('collection_followers')
			.where('collection_id', collectionId)
			.delete();
	}

	async reorderFollowedCollections(
		collectionIds: Collection['id'][]
	): Promise<void> {
		const userId = this.getAuthenticatedUserId();
		await this.assertFollowedCollectionIds(userId, collectionIds);

		await reorderByRank(db, {
			table: 'collection_followers',
			rankedColumn: 'collection_id',
			ids: collectionIds,
			extraWhere: { column: 'user_id', value: userId },
		});
	}

	private async assertFollowedCollectionIds(
		userId: User['id'],
		collectionIds: Collection['id'][]
	): Promise<void> {
		const currentRows = await db
			.from('collection_followers')
			.where('user_id', userId)
			.select('collection_id');
		const currentIds = currentRows.map((row) => row.collection_id as number);

		if (!idSetsMatch(currentIds, collectionIds)) {
			throw new NotFollowingCollectionException(
				'The submitted collections are not all followed by the authenticated user'
			);
		}
	}

	private async getNextFollowerPosition(userId: User['id']): Promise<number> {
		const row = await db
			.from('collection_followers')
			.where('user_id', userId)
			.max('position as max_position')
			.first();

		const maxPosition = row?.max_position;
		return typeof maxPosition === 'number' ? maxPosition + 1 : 0;
	}

	private getAuthenticatedUserId(): User['id'] {
		return HttpContext.getOrFail().auth.getUserOrFail().id;
	}
}
