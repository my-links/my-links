import PATHS from '#constants/paths';
import Collection from '#models/collection';
import User from '#models/user';
import {
  createCollectionValidator,
  updateCollectionValidator,
} from '#validators/collection';
import type { HttpContext } from '@adonisjs/core/http';

export default class CollectionsController {
  // Dashboard
  async index({ auth, inertia, request, response }: HttpContext) {
    const collections = await this.getCollectionsByAuthorId(auth.user!.id);
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
      return response.redirect('/dashboard');
    }

    const collection = await this.getCollectionById(
      collectionId,
      auth.user!.id
    );
    return inertia.render('collections/edit', {
      collection,
    });
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

  async getCollectionsByAuthorId(authorId: User['id']) {
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
