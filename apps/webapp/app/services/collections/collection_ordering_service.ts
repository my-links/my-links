import { inject } from '@adonisjs/core';
import type { Database } from '@adonisjs/lucid/database';
import db from '@adonisjs/lucid/services/db';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';
import { DateTime } from 'luxon';

import type { Visibility } from '#enums/collections/visibility';
import { InvalidCollectionMembershipException } from '#exceptions/collections/invalid_collection_membership_exception';
import { ForeignCollectionException } from '#exceptions/links/foreign_collection_exception';
import { idSetsMatch } from '#lib/id_set';
import { reorderByRank } from '#lib/reorder_by_rank';
import Collection from '#models/collection';
import type User from '#models/user';

@inject()
export class CollectionOrderingService {
	async reorderOwnedCollections(
		userId: User['id'],
		visibility: Visibility,
		collectionIds: Collection['id'][]
	): Promise<void> {
		await this.assertSectionMembership(userId, visibility, collectionIds);
		await this.rankSection(collectionIds, db);
	}

	async rankSection(
		collectionIds: Collection['id'][],
		client: Database | TransactionClientContract
	): Promise<void> {
		// `NOW()` freezes to transaction start under the tests' wrapped
		// transaction, so the timestamp is computed here instead.
		await reorderByRank(client, {
			table: 'collections',
			rankedColumn: 'id',
			ids: collectionIds,
			touchedAt: DateTime.now().toJSDate(),
		});
	}

	/**
	 * Ownership violation (422) and a stale/incomplete payload (409) are
	 * different failures: the client should retry the latter after a
	 * reload, not treat it as a permissions error.
	 * `movedCollection` joins the section and is expected in the payload.
	 */
	async assertSectionMembership(
		userId: User['id'],
		visibility: Visibility,
		collectionIds: Collection['id'][],
		movedCollection?: Collection,
		client?: TransactionClientContract
	): Promise<void> {
		const ownedCollections = await Collection.query({ client })
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
			await Collection.query({ client })
				.where('author_id', userId)
				.andWhere('visibility', visibility)
				.andWhere('is_default', false)
				.select('id')
		).map((collection) => collection.id);

		const expectedSectionIds =
			movedCollection && !movedCollection.isDefault
				? [...new Set([...currentSectionIds, movedCollection.id])]
				: currentSectionIds;

		if (!idSetsMatch(expectedSectionIds, collectionIds)) {
			throw new InvalidCollectionMembershipException(
				'The submitted collections do not match the current section'
			);
		}
	}

	async getNextCollectionPosition(
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
}
