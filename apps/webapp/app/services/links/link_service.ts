import { inject } from '@adonisjs/core';
import db from '@adonisjs/lucid/services/db';
import { HttpContext } from '@adonisjs/core/http';

import Link from '#models/link';
import { SyncJournalService } from '#services/sync/sync_journal_service';
import { CollectionService } from '#services/collections/collection_service';

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
		protected readonly syncJournalService: SyncJournalService
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
		const link = await Link.query()
			.where('id', id)
			.andWhere('author_id', this.getAuthenticatedUserId())
			.firstOrFail();

		link.favorite = favorite;
		return await link.save();
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
