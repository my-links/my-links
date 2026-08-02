import { inject } from '@adonisjs/core';
import db from '@adonisjs/lucid/services/db';
import { HttpContext } from '@adonisjs/core/http';

import Link from '#models/link';
import { AUDIT_SUBJECT_TYPE } from '#constants/audit';
import { ACTIVITY_EVENT_TYPE } from '#constants/activity';
import { SyncJournalService } from '#services/sync/sync_journal_service';
import { CollectionService } from '#services/collections/collection_service';
import { ActivityEventService } from '#services/activity/activity_event_service';

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
		protected readonly activityEventService: ActivityEventService
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
			await createdLink
				.related('collections')
				.attach(resolvedCollectionIds, transaction);
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
				.andWhere('author_id', userId)
				.firstOrFail();

			link.merge(linkAttributes);
			await link.useTransaction(transaction).save();

			if (collectionIds) {
				const resolvedCollectionIds = await this.resolveCollectionIds(
					collectionIds,
					userId
				);
				await link
					.related('collections')
					.sync(resolvedCollectionIds, true, transaction);
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
			return collectionIds;
		}

		const defaultCollection =
			await this.collectionService.getOrCreateDefaultCollection(userId);
		return [defaultCollection.id];
	}

	async deleteLink(id: number) {
		const userId = this.getAuthenticatedUserId();

		await db.transaction(async (transaction) => {
			const link = await Link.query({ client: transaction })
				.where('id', id)
				.andWhere('author_id', userId)
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
			.andWhere('author_id', userId)
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
			.andWhere('author_id', userId)
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
	 * Feeds the search modal's client-side matcher, which only reads
	 * name/description/url — no `preload('collections')` needed here.
	 */
	async getMyLinks() {
		return await Link.query()
			.where('author_id', this.getAuthenticatedUserId())
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
