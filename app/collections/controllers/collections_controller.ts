import Collection from '#collections/models/collection';
import { createCollectionValidator } from '#collections/validators/create_collection_validator';
import { deleteCollectionValidator } from '#collections/validators/delete_collection_validator';
import { updateCollectionValidator } from '#collections/validators/update_collection_validator';
import User from '#user/models/user';
import type { HttpContext } from '@adonisjs/core/http';
import db from '@adonisjs/lucid/services/db';

export default class CollectionsController {
	// Dashboard
	async index({ auth, inertia, request, response }: HttpContext) {
		const collections = await this.getCollectionsByAuthorId(auth.user!.id);
		if (collections.length === 0) {
			return response.redirectToNamedRoute('collection.create-form');
		}

		const activeCollectionId = Number(request.qs()?.collectionId ?? '');
		const activeCollection = collections.find(
			(c) => c.id === activeCollectionId
		);

		if (!activeCollection && !!activeCollectionId) {
			return response.redirectToNamedRoute('dashboard');
		}

		// TODO: Create DTOs
		return inertia.render('dashboard', {
			collections: collections.map((collection) => collection.serialize()),
			activeCollection:
				activeCollection?.serialize() || collections[0].serialize(),
		});
	}

	// Create collection form
	async showCreatePage({ inertia, auth }: HttpContext) {
		const collections = await this.getCollectionsByAuthorId(auth.user!.id);
		return inertia.render('collections/create', {
			disableHomeLink: collections.length === 0,
		});
	}

	// Method called when creating a collection
	async store({ request, response, auth }: HttpContext) {
		const payload = await request.validateUsing(createCollectionValidator);
		const collection = await Collection.create({
			...payload,
			authorId: auth.user?.id!,
		});
		return this.redirectToCollectionId(response, collection.id);
	}

	async showEditPage({ auth, request, inertia, response }: HttpContext) {
		const collectionId = request.qs()?.collectionId;
		if (!collectionId) {
			return response.redirectToNamedRoute('dashboard');
		}

		const collection = await this.getCollectionById(
			collectionId,
			auth.user!.id
		);
		return inertia.render('collections/edit', {
			collection,
		});
	}

	async update({ request, auth, response }: HttpContext) {
		const { params, ...payload } = await request.validateUsing(
			updateCollectionValidator
		);

		// Cant use validator (vinejs) custom rule 'cause its too generic,
		// because we have to find a collection by identifier and
		// check whether the current user is the author.
		// https://vinejs.dev/docs/extend/custom_rules
		await this.getCollectionById(params.id, auth.user!.id);

		await Collection.updateOrCreate(
			{
				id: params.id,
			},
			payload
		);
		return this.redirectToCollectionId(response, params.id);
	}

	async showDeletePage({ auth, request, inertia, response }: HttpContext) {
		const collectionId = request.qs()?.collectionId;
		if (!collectionId) {
			return response.redirectToNamedRoute('dashboard');
		}

		const collection = await this.getCollectionById(
			collectionId,
			auth.user!.id
		);
		return inertia.render('collections/delete', {
			collection,
		});
	}

	async delete({ request, auth, response }: HttpContext) {
		const { params } = await request.validateUsing(deleteCollectionValidator);
		const collection = await this.getCollectionById(params.id, auth.user!.id);
		await collection.delete();
		return response.redirectToNamedRoute('dashboard');
	}

	async getTotalCollectionsCount() {
		const totalCount = await db.from('collections').count('* as total');
		return Number(totalCount[0].total);
	}

	/**
	 * Get collection by id.
	 *
	 * /!\ Only return private collection (create by the current user)
	 */
	async getCollectionById(id: Collection['id'], userId: User['id']) {
		return await Collection.query()
			.where('id', id)
			.andWhere('author_id', userId)
			.firstOrFail();
	}

	async getCollectionsByAuthorId(authorId: User['id']) {
		return await Collection.query()
			.where('author_id', authorId)
			.orderBy('created_at')
			.preload('links');
	}

	redirectToCollectionId(
		response: HttpContext['response'],
		collectionId: Collection['id']
	) {
		return response.redirectToNamedRoute('dashboard', {
			qs: { collectionId },
		});
	}
}
