import { inject } from '@adonisjs/core';
import db from '@adonisjs/lucid/services/db';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';

import Link from '#models/link';
import type User from '#models/user';
import { idSetsMatch } from '#lib/id_set';
import Collection from '#models/collection';
import { AUDIT_SUBJECT_TYPE } from '#constants/audit';
import { ACTIVITY_EVENT_TYPE } from '#constants/activity';
import { SyncJournalService } from '#services/sync/sync_journal_service';
import { ActivityEventService } from '#services/activity/activity_event_service';
import ForeignCollectionException from '#exceptions/links/foreign_collection_exception';
import InvalidCollectionMembershipException from '#exceptions/collections/invalid_collection_membership_exception';

const COLLECTION_LINK_TABLE = 'collection_link';

type PositionedAttachment = { position: number };

/**
 * Owns positioning for the `collection_link` pivot — bookkeeping Lucid's
 * relation helpers don't cover on their own.
 */
@inject()
export class CollectionLinkService {
	constructor(
		private readonly syncJournalService: SyncJournalService,
		private readonly activityEventService: ActivityEventService
	) {}

	async getNextLinkPosition(
		collectionId: Collection['id'],
		client?: TransactionClientContract
	): Promise<number> {
		const row = await this.selectFrom(client)
			.where('collection_id', collectionId)
			.max('position as max_position')
			.first();

		const maxPosition = row?.max_position;
		return typeof maxPosition === 'number' ? maxPosition + 1 : 0;
	}

	async attachLinksAtEnd(
		collection: Collection,
		linkIds: Link['id'][],
		client?: TransactionClientContract
	): Promise<void> {
		let nextPosition = await this.getNextLinkPosition(collection.id, client);
		const attachments: Record<number, PositionedAttachment> = {};

		for (const linkId of linkIds) {
			attachments[linkId] = { position: nextPosition };
			nextPosition += 1;
		}

		await collection.related('links').attach(attachments, client);
	}

	async buildPositionedAttachments(
		collectionIds: Collection['id'][],
		client?: TransactionClientContract
	): Promise<Record<number, PositionedAttachment>> {
		const attachments: Record<number, PositionedAttachment> = {};

		for (const collectionId of collectionIds) {
			attachments[collectionId] = {
				position: await this.getNextLinkPosition(collectionId, client),
			};
		}

		return attachments;
	}

	async reorderLinksInCollection(
		collection: Collection,
		linkIds: Link['id'][]
	): Promise<void> {
		await this.assertLinkSetMatches(collection.id, linkIds);

		await db.transaction(async (transaction) => {
			await transaction.rawQuery(
				`UPDATE collection_link AS target
				 SET position = ordered.rank - 1
				 FROM UNNEST(?::int[]) WITH ORDINALITY AS ordered(link_id, rank)
				 WHERE target.collection_id = ? AND target.link_id = ordered.link_id`,
				[linkIds, collection.id]
			);
			await this.syncJournalService.markLinksChanged(linkIds, transaction);
		});
	}

	async moveLinkBetweenCollections(
		userId: User['id'],
		linkId: Link['id'],
		fromCollectionId: Collection['id'],
		toCollectionId: Collection['id']
	): Promise<void> {
		if (fromCollectionId === toCollectionId) {
			return;
		}

		const link = await this.findOwnedLink(userId, linkId);
		await this.assertOwnsCollections(userId, [
			fromCollectionId,
			toCollectionId,
		]);
		await this.assertLinkInCollection(linkId, fromCollectionId);

		await db.transaction(async (transaction) => {
			await link.related('collections').detach([fromCollectionId], transaction);
			const position = await this.getNextLinkPosition(
				toCollectionId,
				transaction
			);
			await link
				.related('collections')
				.attach({ [toCollectionId]: { position } }, transaction);
			await this.syncJournalService.markLinksChanged([linkId], transaction);
			await this.activityEventService.record(
				{
					type: ACTIVITY_EVENT_TYPE.LINK_UPDATED,
					userId,
					subjectType: AUDIT_SUBJECT_TYPE.LINK,
					subjectId: linkId,
					metadata: { fromCollectionId, toCollectionId },
				},
				transaction
			);
		});
	}

	async addLinkToCollection(
		userId: User['id'],
		linkId: Link['id'],
		collectionId: Collection['id']
	): Promise<void> {
		const link = await this.findOwnedLink(userId, linkId);
		await this.assertOwnsCollections(userId, [collectionId]);

		if (await this.isLinkInCollection(linkId, collectionId)) {
			return;
		}

		await db.transaction(async (transaction) => {
			const position = await this.getNextLinkPosition(
				collectionId,
				transaction
			);
			await link
				.related('collections')
				.attach({ [collectionId]: { position } }, transaction);
			await this.syncJournalService.markLinksChanged([linkId], transaction);
			await this.activityEventService.record(
				{
					type: ACTIVITY_EVENT_TYPE.LINK_UPDATED,
					userId,
					subjectType: AUDIT_SUBJECT_TYPE.LINK,
					subjectId: linkId,
					metadata: { collectionId },
				},
				transaction
			);
		});
	}

	private async findOwnedLink(
		userId: User['id'],
		linkId: Link['id']
	): Promise<Link> {
		const link = await Link.query()
			.where('id', linkId)
			.andWhere('author_id', userId)
			.first();

		if (!link) {
			throw new ForeignCollectionException(
				'The link does not belong to the authenticated user'
			);
		}

		return link;
	}

	private async assertOwnsCollections(
		userId: User['id'],
		collectionIds: Collection['id'][]
	): Promise<void> {
		const owned = await Collection.query()
			.where('author_id', userId)
			.whereIn('id', collectionIds);

		if (owned.length !== new Set(collectionIds).size) {
			throw new ForeignCollectionException(
				'One or more collections do not belong to the authenticated user'
			);
		}
	}

	private async assertLinkInCollection(
		linkId: Link['id'],
		collectionId: Collection['id']
	): Promise<void> {
		if (!(await this.isLinkInCollection(linkId, collectionId))) {
			throw new InvalidCollectionMembershipException(
				'The link is not in the source collection'
			);
		}
	}

	private async isLinkInCollection(
		linkId: Link['id'],
		collectionId: Collection['id']
	): Promise<boolean> {
		const row = await this.selectFrom(undefined)
			.where('collection_id', collectionId)
			.andWhere('link_id', linkId)
			.first();
		return row != null;
	}

	private async assertLinkSetMatches(
		collectionId: Collection['id'],
		linkIds: Link['id'][]
	): Promise<void> {
		const rows = await this.selectFrom(undefined)
			.where('collection_id', collectionId)
			.select('link_id');
		const currentIds = rows.map((row) => row.link_id as number);

		if (!idSetsMatch(currentIds, linkIds)) {
			throw new InvalidCollectionMembershipException(
				'The submitted links do not match the collection membership'
			);
		}
	}

	private selectFrom(client?: TransactionClientContract) {
		if (client) {
			return client.from(COLLECTION_LINK_TABLE);
		}
		return db.from(COLLECTION_LINK_TABLE);
	}
}
