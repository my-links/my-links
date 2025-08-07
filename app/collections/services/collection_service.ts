import { Visibility } from '#collections/enums/visibility';
import Collection from '#collections/models/collection';
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

	async getCollectionsByAuthorId() {
		const context = this.getAuthContext();
		return await Collection.query()
			.where('author_id', context.auth.user!.id)
			.orderBy('created_at')
			.preload('links');
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

	getAuthContext() {
		const context = HttpContext.getOrFail();
		if (!context.auth.user || !context.auth.user.id) {
			throw new Error('User not authenticated');
		}
		return context;
	}
}
