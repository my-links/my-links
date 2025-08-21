import { Visibility } from '#collections/enums/visibility';
import Collection from '#collections/models/collection';
import { collectionIdValidator } from '#collections/validators/collection_id_validator';
import { HttpContext } from '@adonisjs/core/http';
import db from '@adonisjs/lucid/services/db';

type CreateCollectionPayload = {
	name: string;
	description: string | null;
	visibility: Visibility;
};

type UpdateCollectionPayload = CreateCollectionPayload;

export class CollectionService {
	async getCollectionById(id: Collection['id']) {
		const context = this.getAuthContext();
		return await Collection.query()
			.where('id', id)
			.andWhere('author_id', context.auth.user!.id)
			.firstOrFail();
	}

	async getCollectionsForAuthenticatedUser() {
		const context = this.getAuthContext();
		return await Collection.query()
			.where('author_id', context.auth.user!.id)
			.orderBy('created_at')
			.preload('links', (q) => q.orderBy('favorite', 'desc'));
	}

	async getTotalCollectionsCount() {
		const totalCount = await db.from('collections').count('* as total');
		return Number(totalCount[0].total);
	}

	createCollection(payload: CreateCollectionPayload) {
		const context = this.getAuthContext();
		return Collection.create({
			...payload,
			authorId: context.auth.user!.id,
		});
	}

	async updateCollection(
		id: Collection['id'],
		payload: UpdateCollectionPayload
	) {
		const context = this.getAuthContext();
		return await Collection.query()
			.where('id', id)
			.andWhere('author_id', context.auth.user!.id)
			.update(payload);
	}

	deleteCollection(id: Collection['id']) {
		const context = this.getAuthContext();
		return Collection.query()
			.where('id', id)
			.andWhere('author_id', context.auth.user!.id)
			.delete();
	}

	getPublicCollectionById(id: Collection['id']) {
		return Collection.query()
			.where('id', id)
			.andWhere('visibility', Visibility.PUBLIC)
			.preload('links')
			.preload('author')
			.firstOrFail();
	}

	private getAuthContext() {
		const context = HttpContext.getOrFail();
		if (!context.auth.user || !context.auth.user.id) {
			throw new Error('User not authenticated');
		}
		return context;
	}

	async validateCollectionId(collectionIdRequired: boolean = true) {
		const ctx = HttpContext.getOrFail();
		const { collectionId } = await ctx.request.validateUsing(
			collectionIdValidator
		);
		if (!collectionId && collectionIdRequired) {
			this.redirectToDashboard();
			return null;
		}
		return collectionId;
	}

	redirectToCollectionId(collectionId: Collection['id']) {
		const ctx = HttpContext.getOrFail();
		return ctx.response.redirectToNamedRoute('dashboard', {
			qs: { collectionId },
		});
	}

	redirectToDashboard() {
		const ctx = HttpContext.getOrFail();
		return ctx.response.redirectToNamedRoute('dashboard');
	}
}
