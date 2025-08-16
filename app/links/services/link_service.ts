import Link from '#links/models/link';
import { HttpContext } from '@adonisjs/core/http';

type CreateLinkPayload = {
	name: string;
	description?: string;
	url: string;
	favorite: boolean;
	collectionId: number;
};

type UpdateLinkPayload = CreateLinkPayload;

export class LinkService {
	createLink(payload: CreateLinkPayload) {
		const context = this.getAuthContext();
		return Link.create({
			...payload,
			authorId: context.auth.user!.id,
		});
	}

	updateLink(id: number, payload: UpdateLinkPayload) {
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

	getAuthContext() {
		const context = HttpContext.getOrFail();
		if (!context.auth.user || !context.auth.user.id) {
			throw new Error('User not authenticated');
		}
		return context;
	}
}
