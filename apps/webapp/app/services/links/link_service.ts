import { events } from '#generated/events';
import Link from '#models/link';
import { HttpContext } from '@adonisjs/core/http';
import db from '@adonisjs/lucid/services/db';

type LinkPayload = {
	name: string;
	description?: string;
	url: string;
	favorite: boolean;
	collectionId: number;
};

export class LinkService {
	async createLink(payload: LinkPayload) {
		const context = this.getAuthContext();
		const link = await Link.create({
			...payload,
			authorId: context.auth.user!.id,
		});

		events.LinkCreated.dispatch(link);

		return link;
	}

	async updateLink(id: number, payload: LinkPayload) {
		const context = this.getAuthContext();
		const link = await Link.query()
			.where('id', id)
			.andWhere('author_id', context.auth.user!.id)
			.firstOrFail();

		await link.merge(payload).save();
		events.LinkUpdated.dispatch(link);

		return link;
	}

	async deleteLink(id: number) {
		const context = this.getAuthContext();
		const link = await Link.query()
			.where('id', id)
			.andWhere('author_id', context.auth.user!.id)
			.firstOrFail();

		await link.delete();
		events.LinkDeleted.dispatch(link.id);

		return link;
	}

	async getLinkById(id: Link['id'], userId: Link['id']) {
		return await Link.query()
			.where('id', id)
			.andWhere('author_id', userId)
			.firstOrFail();
	}

	async updateFavorite(id: number, favorite: boolean) {
		const link = await Link.query()
			.where('id', id)
			.andWhere('author_id', this.getAuthContext().auth.user!.id)
			.firstOrFail();

		await link.merge({ favorite }).save();
		events.LinkUpdated.dispatch(link);

		return link;
	}

	async getMyFavoriteLinks() {
		const context = this.getAuthContext();
		return await Link.query()
			.where('author_id', context.auth.user!.id)
			.where('favorite', true)
			.orderBy('created_at');
	}

	private getAuthContext() {
		const context = HttpContext.getOrFail();
		context.auth.getUserOrFail();
		return context;
	}

	async getTotalLinksCount() {
		const totalCount = await db.from('links').count('* as total');
		return Number(totalCount[0].total);
	}
}
