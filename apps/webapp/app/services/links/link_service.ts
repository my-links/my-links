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
	collectionId?: number;
};

@inject()
export class LinkService {
	constructor(protected readonly collectionService: CollectionService) {}

	async createLink(payload: LinkPayload) {
		const userId = this.getAuthenticatedUserId();
		const collectionId =
			payload.collectionId ??
			(await this.collectionService.getOrCreateDefaultCollection(userId)).id;

		return Link.create({
			...payload,
			collectionId,
			authorId: userId,
		});
	}

	updateLink(id: number, payload: LinkPayload) {
		return Link.query()
			.where('id', id)
			.andWhere('author_id', this.getAuthenticatedUserId())
			.update(payload);
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
