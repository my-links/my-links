import { DateTime } from 'luxon';
import { inject } from '@adonisjs/core';
import db from '@adonisjs/lucid/services/db';
import { HttpContext } from '@adonisjs/core/http';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';

import User from '#models/user';
import { idSetsMatch } from '#lib/id_set';
import Collection from '#models/collection';
import { reorderByRank } from '#lib/reorder_by_rank';
import { AUDIT_SUBJECT_TYPE } from '#constants/audit';
import { ACTIVITY_EVENT_TYPE } from '#constants/activity';
import { SyncJournalService } from '#services/sync/sync_journal_service';
import { VISIBILITY, type Visibility } from '#enums/collections/visibility';
import { ActivityEventService } from '#services/activity/activity_event_service';
import { CollectionLinkService } from '#services/collections/collection_link_service';
import ForeignCollectionException from '#exceptions/links/foreign_collection_exception';
import NotFollowingCollectionException from '#exceptions/collections/not_following_collection_exception';
import CannotFollowOwnCollectionException from '#exceptions/collections/cannot_follow_own_collection_exception';
import InvalidCollectionMembershipException from '#exceptions/collections/invalid_collection_membership_exception';
import CannotShareDefaultCollectionException from '#exceptions/collections/cannot_share_default_collection_exception';
import CannotDeleteDefaultCollectionException from '#exceptions/collections/cannot_delete_default_collection_exception';

const DEFAULT_COLLECTION_NAME = 'Inbox';

// The Inbox is pinned in the sidebar, outside the sortable sections, so it never competes for a rank with the collections the user orders.
const DEFAULT_COLLECTION_POSITION = 0;

type CollectionPayload = {
	name: string;
	description: string | null;
	visibility: Visibility;
	icon: string | null;
};

@inject()
export class CollectionService {
	constructor(
		protected readonly syncJournalService: SyncJournalService,
		protected readonly activityEventService: ActivityEventService,
		protected readonly collectionLinkService: CollectionLinkService
	) {}

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
	async getCollectionsForAuthenticatedUser() {
		return await Collection.query()
			.where('author_id', this.getAuthenticatedUserId())
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

	async createCollection(payload: CollectionPayload) {
		const userId = this.getAuthenticatedUserId();
		const position = await this.getNextCollectionPosition(
			userId,
			payload.visibility
		);
		const collection = await Collection.create({
			...payload,
			authorId: userId,
			position,
		});

		await this.activityEventService.record({
			type: ACTIVITY_EVENT_TYPE.COLLECTION_CREATED,
			userId,
			subjectType: AUDIT_SUBJECT_TYPE.COLLECTION,
			subjectId: collection.id,
		});

		return collection;
	}

	/**
	 * Persisted through the model rather than a bare `update()` so
	 * `updated_at` is bumped and the change reaches the delta feed
	 * (`GET /api/v1/sync`).
	 */
	async updateCollection(id: Collection['id'], payload: CollectionPayload) {
		const userId = this.getAuthenticatedUserId();
		const collection = await Collection.query()
			.where('id', id)
			.apply((scopes) => scopes.ownedBy(userId))
			.firstOrFail();

		const wasPublic = collection.visibility === VISIBILITY.PUBLIC;
		const visibilityChanged = collection.visibility !== payload.visibility;

		// The Inbox is pinned outside the ordered sections, and those are built
		// per visibility — a public one would show up twice and make every
		// reorder of the public section fail as incomplete. Only the sharing
		// direction is refused: an Inbox made public before this rule existed
		// has to keep its way back.
		if (collection.isDefault && payload.visibility === VISIBILITY.PUBLIC) {
			throw new CannotShareDefaultCollectionException(
				'The default collection cannot be made public'
			);
		}

		collection.merge(payload);

		if (visibilityChanged) {
			collection.position = await this.getNextCollectionPosition(
				userId,
				payload.visibility
			);
		}

		await collection.save();

		if (wasPublic && payload.visibility === VISIBILITY.PRIVATE) {
			await this.removeAllFollowers(id);
		}

		await this.activityEventService.record({
			type: ACTIVITY_EVENT_TYPE.COLLECTION_UPDATED,
			userId,
			subjectType: AUDIT_SUBJECT_TYPE.COLLECTION,
			subjectId: id,
		});

		return collection;
	}

	async deleteCollection(id: Collection['id']) {
		const userId = this.getAuthenticatedUserId();
		const collection = await Collection.query()
			.where('id', id)
			.apply((scopes) => scopes.ownedBy(userId))
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

		// Every link filed here changes membership, whether it lands back in
		// the Inbox or merely loses one of its collections — the delta feed
		// only reports it if the link row itself is touched.
		const affectedLinkIds = collection.links.map((link) => link.id);

		return db.transaction(async (transaction) => {
			if (orphanedLinkIds.length > 0) {
				const defaultCollection =
					await this.getOrCreateDefaultCollection(userId);
				await this.collectionLinkService.attachLinksAtEnd(
					defaultCollection,
					orphanedLinkIds,
					transaction
				);
			}

			await Collection.query({ client: transaction })
				.where('id', id)
				.apply((scopes) => scopes.ownedBy(userId))
				.delete();

			await this.syncJournalService.markLinksChanged(
				affectedLinkIds,
				transaction
			);
			await this.syncJournalService.recordDeletedCollection(
				userId,
				id,
				transaction
			);
			await this.activityEventService.record(
				{
					type: ACTIVITY_EVENT_TYPE.COLLECTION_DELETED,
					userId,
					subjectType: AUDIT_SUBJECT_TYPE.COLLECTION,
					subjectId: id,
					metadata: { orphanedLinks: orphanedLinkIds.length },
				},
				transaction
			);
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

		const defaultCollection = await Collection.create(
			{
				name: DEFAULT_COLLECTION_NAME,
				description: null,
				visibility: VISIBILITY.PRIVATE,
				icon: null,
				authorId: userId,
				isDefault: true,
				position: DEFAULT_COLLECTION_POSITION,
			},
			{ client }
		);

		await this.activityEventService.record(
			{
				type: ACTIVITY_EVENT_TYPE.COLLECTION_CREATED,
				userId,
				subjectType: AUDIT_SUBJECT_TYPE.COLLECTION,
				subjectId: defaultCollection.id,
				metadata: { automatic: true },
			},
			client
		);

		return defaultCollection;
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

	async reorderOwnedCollections(
		visibility: Visibility,
		collectionIds: Collection['id'][]
	): Promise<void> {
		const userId = this.getAuthenticatedUserId();
		await this.assertOwnedCollectionIds(userId, visibility, collectionIds);

		// `NOW()` freezes to transaction start under the tests' wrapped
		// transaction, so the timestamp is computed here instead.
		await reorderByRank(db, {
			table: 'collections',
			rankedColumn: 'id',
			ids: collectionIds,
			touchedAt: DateTime.now().toJSDate(),
		});
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

	/**
	 * Ownership violation (422) and a stale/incomplete payload (409) are
	 * different failures — the client should retry the latter after a
	 * reload, not treat it as a permissions error.
	 */
	private async assertOwnedCollectionIds(
		userId: User['id'],
		visibility: Visibility,
		collectionIds: Collection['id'][]
	): Promise<void> {
		const ownedCollections = await Collection.query()
			.where('author_id', userId)
			.whereIn('id', collectionIds);

		if (ownedCollections.length !== new Set(collectionIds).size) {
			throw new ForeignCollectionException(
				'One or more collections do not belong to the authenticated user'
			);
		}

		// Mirrors `getMyPrivateCollections`: the Inbox is pinned outside the
		// sortable sections, so the client never submits it and counting it here
		// would reject every private reorder as incomplete.
		const currentSectionIds = (
			await Collection.query()
				.where('author_id', userId)
				.andWhere('visibility', visibility)
				.andWhere('is_default', false)
				.select('id')
		).map((collection) => collection.id);

		if (!idSetsMatch(currentSectionIds, collectionIds)) {
			throw new InvalidCollectionMembershipException(
				'The submitted collections do not match the current section'
			);
		}
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

	private async getNextCollectionPosition(
		authorId: User['id'],
		visibility: Visibility,
		client?: TransactionClientContract
	): Promise<number> {
		const query = client ? client.from('collections') : db.from('collections');
		const row = await query
			.where('author_id', authorId)
			.andWhere('visibility', visibility)
			.andWhere('is_default', false)
			.max('position as max_position')
			.first();

		const maxPosition = row?.max_position;
		return typeof maxPosition === 'number' ? maxPosition + 1 : 0;
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
