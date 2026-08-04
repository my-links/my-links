import db from '@adonisjs/lucid/services/db';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';

import type Link from '#models/link';
import type Collection from '#models/collection';

const COLLECTION_LINK_TABLE = 'collection_link';

type PositionedAttachment = { position: number };

/**
 * Owns positioning for the `collection_link` pivot — bookkeeping Lucid's
 * relation helpers don't cover on their own.
 */
export class CollectionLinkService {
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

	private selectFrom(client?: TransactionClientContract) {
		if (client) {
			return client.from(COLLECTION_LINK_TABLE);
		}
		return db.from(COLLECTION_LINK_TABLE);
	}
}
