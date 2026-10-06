import { inject } from '@adonisjs/core';
import db from '@adonisjs/lucid/services/db';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';

import User from '#models/user';
import Collection from '#models/collection';
import { AUDIT_SUBJECT_TYPE } from '#constants/audit';
import type { RequestOrigin } from '#lib/request_origin';
import { ACTIVITY_EVENT_TYPE } from '#constants/activity';
import { SyncJournalService } from '#services/sync/sync_journal_service';
import { VISIBILITY, type Visibility } from '#enums/collections/visibility';
import { ActivityEventService } from '#services/activity/activity_event_service';
import { CollectionLinkService } from '#services/collections/collection_link_service';
import { CollectionOrderingService } from '#services/collections/collection_ordering_service';
import { CollectionFollowerService } from '#services/collections/collection_follower_service';
import { CannotShareDefaultCollectionException } from '#exceptions/collections/cannot_share_default_collection_exception';
import { CannotDeleteDefaultCollectionException } from '#exceptions/collections/cannot_delete_default_collection_exception';

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
		protected readonly collectionLinkService: CollectionLinkService,
		protected readonly collectionOrderingService: CollectionOrderingService,
		protected readonly collectionFollowerService: CollectionFollowerService
	) {}

	async createCollection(
		userId: User['id'],
		payload: CollectionPayload,
		origin: RequestOrigin
	) {
		const position =
			await this.collectionOrderingService.getNextCollectionPosition(
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
			origin,
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
	async updateCollection(
		userId: User['id'],
		id: Collection['id'],
		payload: CollectionPayload,
		origin: RequestOrigin
	) {
		const collection = await Collection.query()
			.where('id', id)
			.apply((scopes) => scopes.ownedBy(userId))
			.firstOrFail();

		const wasPublic = collection.visibility === VISIBILITY.PUBLIC;
		const visibilityChanged = collection.visibility !== payload.visibility;

		// The Inbox is pinned outside the ordered sections, and those are built
		// per visibility: a public one would show up twice and make every
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
			collection.position =
				await this.collectionOrderingService.getNextCollectionPosition(
					userId,
					payload.visibility
				);
		}

		await collection.save();

		if (wasPublic && payload.visibility === VISIBILITY.PRIVATE) {
			await this.collectionFollowerService.removeAllFollowers(id);
		}

		await this.activityEventService.record({
			type: ACTIVITY_EVENT_TYPE.COLLECTION_UPDATED,
			userId,
			origin,
			subjectType: AUDIT_SUBJECT_TYPE.COLLECTION,
			subjectId: id,
		});

		return collection;
	}

	async deleteCollection(
		userId: User['id'],
		id: Collection['id'],
		origin: RequestOrigin
	) {
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
		// the Inbox or merely loses one of its collections: the delta feed
		// only reports it if the link row itself is touched.
		const affectedLinkIds = collection.links.map((link) => link.id);

		return db.transaction(async (transaction) => {
			if (orphanedLinkIds.length > 0) {
				const defaultCollection = await this.getOrCreateDefaultCollection(
					userId,
					origin
				);
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
					origin,
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
		origin: RequestOrigin,
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
				origin,
				subjectType: AUDIT_SUBJECT_TYPE.COLLECTION,
				subjectId: defaultCollection.id,
				metadata: { automatic: true },
			},
			client
		);

		return defaultCollection;
	}
}
