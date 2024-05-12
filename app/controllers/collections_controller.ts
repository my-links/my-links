import PATHS from '#constants/paths';
import Collection from '#models/collection';
import User from '#models/user';
import { collectionValidator } from '#validators/collection';
import type { HttpContext } from '@adonisjs/core/http';

export default class CollectionsController {
  // Dashboard
  async index({ auth, inertia, request, response }: HttpContext) {
    const collections = await this.getCollectionByAuthorId(auth.user!.id);
    if (collections.length === 0) {
      return response.redirect('/collections/create');
    }

    const activeCollectionId = request.qs()?.collectionId ?? '';
    const activeCollection = collections.find(
      (c) => c.id === activeCollectionId
    );

    if (!activeCollection && !!activeCollectionId) {
      return response.redirect('/dashboard');
    }

    return inertia.render('dashboard', {
      collections,
      activeCollection: activeCollection || collections[0],
    });
  }

  // Create collection form
  async showCreatePage({ inertia, auth }: HttpContext) {
    const collections = await this.getCollectionByAuthorId(auth.user!.id);
    return inertia.render('collections/create', {
      disableHomeLink: collections.length === 0,
    });
  }

  // Method called when creating a collection
  async store({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(collectionValidator);
    const collection = await Collection.create({
      ...payload,
      authorId: auth.user?.id!,
    });
    return this.redirectToCollectionId(response, collection.id);
  }

  async getCollectionById(id: Collection['id']) {
    return await Collection.find(id);
  }

  async getCollectionByAuthorId(authorId: User['id']) {
    return await Collection.query()
      .where('author_id', authorId)
      .preload('links');
  }

  redirectToCollectionId(
    response: HttpContext['response'],
    collectionId: Collection['id']
  ) {
    return response.redirect(`${PATHS.DASHBOARD}?collectionId=${collectionId}`);
  }
}
