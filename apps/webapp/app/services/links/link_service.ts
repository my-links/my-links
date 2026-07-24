import { inject } from '@adonisjs/core';
import db from '@adonisjs/lucid/services/db';
import { HttpContext } from '@adonisjs/core/http';

import Link from '#models/link';
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
	constructor(protected readonly collectionService: CollectionService) {}

	async createLink(payload: LinkPayload) {
		const userId = this.getAuthenticatedUserId();
		const { collectionIds, ...linkAttributes } = payload;
		const resolvedCollectionIds = await this.resolveCollectionIds(
			collectionIds,
			userId
		);

		return db.transaction(async (transaction) => {
			const link = await Link.create(
				{ ...linkAttributes, authorId: userId },
				{ client: transaction }
			);
			await link
				.related('collections')
				.attach(resolvedCollectionIds, transaction);
			return link;
		});
	}

	async updateLink(id: number, payload: LinkPayload) {
		const userId = this.getAuthenticatedUserId();
		const { collectionIds, ...linkAttributes } = payload;

		return db.transaction(async (transaction) => {
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
			}

			return link;
		});
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

	deleteLink(id: number) {
		return Link.query()
			.where('id', id)
			.andWhere('author_id', this.getAuthenticatedUserId())
			.delete();
	}

	async getLinkById(id: Link['id'], userId: Link['id']) {
		return await Link.query()
			.where('id', id)
			.andWhere('author_id', userId)
			.preload('collections')
			.firstOrFail();
	}

	updateFavorite(id: number, favorite: boolean) {
		return Link.query()
			.where('id', id)
			.andWhere('author_id', this.getAuthenticatedUserId())
			.update({ favorite });
	}

	async getMyFavoriteLinks() {
		return await Link.query()
			.where('author_id', this.getAuthenticatedUserId())
			.where('favorite', true)
			.preload('collections')
			.orderBy('created_at');
	}

	private getAuthenticatedUserId() {
		return HttpContext.getOrFail().auth.getUserOrFail().id;
	}

	async getTotalLinksCount() {
		const totalCount = await db.from('links').count('* as total');
		return Number(totalCount[0].total);
	}
}
