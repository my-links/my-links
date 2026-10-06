import { DateTime } from 'luxon';
import { inject } from '@adonisjs/core';
import db from '@adonisjs/lucid/services/db';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';

import type User from '#models/user';
import { idSetsMatch } from '#lib/id_set';
import Collection from '#models/collection';
import { reorderByRank } from '#lib/reorder_by_rank';
import type { Visibility } from '#enums/collections/visibility';
import { ForeignCollectionException } from '#exceptions/links/foreign_collection_exception';
import { InvalidCollectionMembershipException } from '#exceptions/collections/invalid_collection_membership_exception';

@inject()
export class CollectionOrderingService {
	async reorderOwnedCollections(
		userId: User['id'],
		visibility: Visibility,
		collectionIds: Collection['id'][]
	): Promise<void> {
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

	/**
	 * Ownership violation (422) and a stale/incomplete payload (409) are
	 * different failures: the client should retry the latter after a
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
