import { inject } from '@adonisjs/core';
import db from '@adonisjs/lucid/services/db';
import { HttpContext } from '@adonisjs/core/http';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';

import Link from '#models/link';
import Collection from '#models/collection';
import { AUDIT_SUBJECT_TYPE } from '#constants/audit';
import { ACTIVITY_EVENT_TYPE } from '#constants/activity';
import { SyncJournalService } from '#services/sync/sync_journal_service';
import { CollectionService } from '#services/collections/collection_service';
import { ActivityEventService } from '#services/activity/activity_event_service';
import { CollectionLinkService } from '#services/collections/collection_link_service';
import ForeignCollectionException from '#exceptions/links/foreign_collection_exception';

type LinkPayload = {
	name: string;
	description?: string;
	url: string;
	favorite: boolean;
	collectionIds?: number[];
};

@inject()
export class LinkService {
	constructor(
		protected readonly collectionService: CollectionService,
		protected readonly syncJournalService: SyncJournalService,
		protected readonly activityEventService: ActivityEventService,
		protected readonly collectionLinkService: CollectionLinkService
	) {}

	async createLink(payload: LinkPayload) {
		const userId = this.getAuthenticatedUserId();
		const { collectionIds, ...linkAttributes } = payload;
		const resolvedCollectionIds = await this.resolveCollectionIds(
			collectionIds,
			userId
		);

		const link = await db.transaction(async (transaction) => {
			const createdLink = await Link.create(
				{ ...linkAttributes, authorId: userId },
				{ client: transaction }
			);
			const attachments =
				await this.collectionLinkService.buildPositionedAttachments(
					resolvedCollectionIds,
					transaction
				);
			await createdLink.related('collections').attach(attachments, transaction);
			await this.activityEventService.record(
				{
					type: ACTIVITY_EVENT_TYPE.LINK_CREATED,
					userId,
					subjectType: AUDIT_SUBJECT_TYPE.LINK,
					subjectId: createdLink.id,
				},
				transaction
			);
			return createdLink;
		});

		return this.getLinkById(link.id, userId);
	}

	async updateLink(id: number, payload: LinkPayload) {
		const userId = this.getAuthenticatedUserId();
		const { collectionIds, ...linkAttributes } = payload;

		await db.transaction(async (transaction) => {
			const link = await Link.query({ client: transaction })
				.where('id', id)
				.apply((scopes) => scopes.ownedBy(userId))
				.firstOrFail();

			link.merge(linkAttributes);
			await link.useTransaction(transaction).save();

			if (collectionIds) {
				const resolvedCollectionIds = await this.resolveCollectionIds(
					collectionIds,
					userId
				);
				await this.replaceLinkCollections(
					link,
					resolvedCollectionIds,
					transaction
				);
				await this.syncJournalService.markLinksChanged([id], transaction);
			}

			await this.activityEventService.record(
				{
					type: ACTIVITY_EVENT_TYPE.LINK_UPDATED,
					userId,
					subjectType: AUDIT_SUBJECT_TYPE.LINK,
					subjectId: id,
				},
				transaction
			);
		});

		return this.getLinkById(id, userId);
	}

	private async resolveCollectionIds(
		collectionIds: number[] | undefined,
		userId: number
	) {
		if (collectionIds && collectionIds.length > 0) {
			const ownedCollections = await Collection.query()
				.where('author_id', userId)
				.whereIn('id', collectionIds);

			if (ownedCollections.length !== new Set(collectionIds).size) {
				throw new ForeignCollectionException(
					'One or more collections do not belong to the authenticated user'
				);
			}

			return collectionIds;
		}

		const defaultCollection =
			await this.collectionService.getOrCreateDefaultCollection(userId);
		return [defaultCollection.id];
	}

	/**
	 * Replaces membership without disturbing positions of collections the
	 * link stays in — Lucid's `sync()` attaches new rows with no position,
	 * which would silently drop them to the top of the collection.
	 */
	private async replaceLinkCollections(
		link: Link,
		collectionIds: number[],
		transaction: TransactionClientContract
	): Promise<void> {
		const currentCollections = await link
			.related('collections')
			.query()
			.useTransaction(transaction);
		const currentCollectionIds = currentCollections.map(
			(collection) => collection.id
		);

		const targetIds = new Set(collectionIds);
		const currentIds = new Set(currentCollectionIds);

		const toDetach = currentCollectionIds.filter((cid) => !targetIds.has(cid));
		const toAttach = collectionIds.filter((cid) => !currentIds.has(cid));

		if (toDetach.length > 0) {
			await link.related('collections').detach(toDetach, transaction);
		}

		if (toAttach.length === 0) {
			return;
		}

		const attachments =
			await this.collectionLinkService.buildPositionedAttachments(
				toAttach,
				transaction
			);
		await link.related('collections').attach(attachments, transaction);
	}

	async deleteLink(id: number) {
		const userId = this.getAuthenticatedUserId();

		await db.transaction(async (transaction) => {
			const link = await Link.query({ client: transaction })
				.where('id', id)
				.apply((scopes) => scopes.ownedBy(userId))
				.first();

			if (!link) {
				return;
			}

			await link.useTransaction(transaction).delete();
			await this.syncJournalService.recordDeletedLink(userId, id, transaction);
			await this.activityEventService.record(
				{
					type: ACTIVITY_EVENT_TYPE.LINK_DELETED,
					userId,
					subjectType: AUDIT_SUBJECT_TYPE.LINK,
					subjectId: id,
				},
				transaction
			);
		});
	}

	async getLinkById(id: Link['id'], userId: Link['id']) {
		return await Link.query()
			.where('id', id)
			.apply((scopes) => scopes.ownedBy(userId))
			.preload('collections')
			.firstOrFail();
	}

	/**
	 * Saved through the model rather than a bare `update()` so `updated_at`
	 * is bumped — a favourite toggle has to surface on the delta feed like
	 * any other change (the extension ranks pinned bookmarks off it).
	 */
	async updateFavorite(id: number, favorite: boolean) {
		const userId = this.getAuthenticatedUserId();
		const link = await Link.query()
			.where('id', id)
			.apply((scopes) => scopes.ownedBy(userId))
			.firstOrFail();

		link.favorite = favorite;
		await link.save();

		await this.activityEventService.record({
			type: ACTIVITY_EVENT_TYPE.LINK_FAVORITE_TOGGLED,
			userId,
			subjectType: AUDIT_SUBJECT_TYPE.LINK,
			subjectId: id,
			metadata: { favorite },
		});

		return link;
	}

	async getMyFavoriteLinks() {
		return await Link.query()
			.where('author_id', this.getAuthenticatedUserId())
			.where('favorite', true)
			.preload('collections')
			.orderBy('created_at');
	}

	/**
	 * Feeds the search modal's client-side matcher and its link controls
	 * menu, which needs `collectionIds` to link to a result's collection.
	 */
	async getMyLinks() {
		return await Link.query()
			.where('author_id', this.getAuthenticatedUserId())
			.preload('collections')
			.orderBy('name');
	}

	private getAuthenticatedUserId() {
		return HttpContext.getOrFail().auth.getUserOrFail().id;
	}

	async getTotalLinksCount() {
		const totalCount = await db.from('links').count('* as total');
		return Number(totalCount[0].total);
	}
}
