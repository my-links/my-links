import CollectionsController from '#controllers/collections_controller';
import Link from '#models/link';
import {
  createLinkValidator,
  updateLinkFavoriteStatusValidator,
  updateLinkValidator,
} from '#validators/link';
import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

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
