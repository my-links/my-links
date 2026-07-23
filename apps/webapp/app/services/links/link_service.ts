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
		const context = this.getAuthContext();
		const collectionId =
			payload.collectionId ??
			(
				await this.collectionService.getOrCreateDefaultCollection(
					context.auth.user!.id
				)
			).id;

		return Link.create({
			...payload,
			collectionId,
			authorId: context.auth.user!.id,
		});
	}

	updateLink(id: number, payload: LinkPayload) {
		const context = this.getAuthContext();
		return Link.query()
			.where('id', id)
			.andWhere('author_id', context.auth.user!.id)
			.update(payload);
	}

	deleteLink(id: number) {
		const context = this.getAuthContext();
		return Link.query()
			.where('id', id)
			.andWhere('author_id', context.auth.user!.id)
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
			.andWhere('author_id', this.getAuthContext().auth.user!.id)
			.update({ favorite });
	}

	async getMyFavoriteLinks() {
		const context = this.getAuthContext();
		return await Link.query()
			.where('author_id', context.auth.user!.id)
			.where('favorite', true)
			.orderBy('created_at');
	}

	getAuthContext() {
		const context = HttpContext.getOrFail();
		if (!context.auth.user?.id) {
			throw new Error('User not authenticated');
		}
		return context;
	}
	async getTotalLinksCount() {
		const totalCount = await db.from('links').count('* as total');
		return Number(totalCount[0].total);
	}
}
