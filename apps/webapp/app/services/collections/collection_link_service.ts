import { inject } from '@adonisjs/core';
import db from '@adonisjs/lucid/services/db';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';

import type Link from '#models/link';
import { idSetsMatch } from '#lib/id_set';
import type Collection from '#models/collection';
import { SyncJournalService } from '#services/sync/sync_journal_service';
import InvalidCollectionMembershipException from '#exceptions/collections/invalid_collection_membership_exception';

const COLLECTION_LINK_TABLE = 'collection_link';

type PositionedAttachment = { position: number };

/**
 * Owns positioning for the `collection_link` pivot — bookkeeping Lucid's
 * relation helpers don't cover on their own.
 */
@inject()
export class CollectionLinkService {
	constructor(private readonly syncJournalService: SyncJournalService) {}

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
