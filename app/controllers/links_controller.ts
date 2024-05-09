import CollectionsController from '#controllers/collections_controller';
import Link from '#models/link';
import { linkValidator } from '#validators/link';
import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

@inject()
export default class LinksController {
  constructor(protected collectionsController: CollectionsController) {}

  async showCreatePage({ auth, inertia }: HttpContext) {
    const collections =
      await this.collectionsController.getCollectionByAuthorId(auth.user!.id);
    return inertia.render('links/create', { collections });
  }

  async store({ auth, request, response }: HttpContext) {
    const { collectionId, ...payload } =
      await request.validateUsing(linkValidator);

    await this.collectionsController.getCollectionById(collectionId);
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
}
