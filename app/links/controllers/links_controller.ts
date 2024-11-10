import CollectionsController from '#collections/controllers/collections_controller';
import Link from '#links/models/link';
import { createLinkValidator } from '#links/validators/create_link_validator';
import { deleteLinkValidator } from '#links/validators/delete_link_validator';
import { updateLinkFavoriteStatusValidator } from '#links/validators/update_favorite_link_validator';
import { updateLinkValidator } from '#links/validators/update_link_validator';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';
import db from '@adonisjs/lucid/services/db';

@inject()
export default class LinksController {
	constructor(protected collectionsController: CollectionsController) {}

	async showCreatePage({ auth, inertia }: HttpContext) {
		const collections =
			await this.collectionsController.getCollectionsByAuthorId(auth.user!.id);
		return inertia.render('links/create', { collections });
	}

	async store({ auth, request, response }: HttpContext) {
		const { collectionId, ...payload } =
			await request.validateUsing(createLinkValidator);

		await this.collectionsController.getCollectionById(
			collectionId,
			auth.user!.id
		);
		await Link.create({
			...payload,
			collectionId,
			authorId: auth.user?.id!,
		});
		return this.collectionsController.redirectToCollectionId(
			response,
			collectionId
		);
	}

	async showEditPage({ auth, inertia, request, response }: HttpContext) {
		const linkId = request.qs()?.linkId;
		if (!linkId) {
			return response.redirectToNamedRoute('dashboard');
		}

		const userId = auth.user!.id;
		const collections =
			await this.collectionsController.getCollectionsByAuthorId(userId);
		const link = await this.getLinkById(linkId, userId);

		return inertia.render('links/edit', { collections, link });
	}

	async update({ request, auth, response }: HttpContext) {
		const { params, ...payload } =
			await request.validateUsing(updateLinkValidator);

		// Throw if invalid link id provided
		await this.getLinkById(params.id, auth.user!.id);

		await Link.updateOrCreate(
			{
				id: params.id,
			},
			payload
		);

		return response.redirectToNamedRoute('dashboard', {
			qs: { collectionId: payload.collectionId },
		});
	}

	async toggleFavorite({ request, auth, response }: HttpContext) {
		const { params, favorite } = await request.validateUsing(
			updateLinkFavoriteStatusValidator
		);

		// Throw if invalid link id provided
		await this.getLinkById(params.id, auth.user!.id);

		await Link.updateOrCreate(
			{
				id: params.id,
			},
			{ favorite }
		);

		return response.json({ status: 'ok' });
	}

	async showDeletePage({ auth, inertia, request, response }: HttpContext) {
		const linkId = request.qs()?.linkId;
		if (!linkId) {
			return response.redirectToNamedRoute('dashboard');
		}

		const link = await this.getLinkById(linkId, auth.user!.id);
		await link.load('collection');
		return inertia.render('links/delete', { link });
	}

	async delete({ request, auth, response }: HttpContext) {
		const { params } = await request.validateUsing(deleteLinkValidator);

		const link = await this.getLinkById(params.id, auth.user!.id);
		await link.delete();

		return response.redirectToNamedRoute('dashboard', {
			qs: { collectionId: link.id },
		});
	}

	async getTotalLinksCount() {
		const totalCount = await db.from('links').count('* as total');
		return Number(totalCount[0].total);
	}

	/**
	 * Get link by id.
	 *
	 * /!\ Only return private link (create by the current user)
	 */
	private async getLinkById(id: Link['id'], userId: Link['id']) {
		return await Link.query()
			.where('id', id)
			.andWhere('author_id', userId)
			.firstOrFail();
	}
}
