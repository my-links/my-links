import PATHS from '#constants/paths';
import Collection from '#models/collection';
import { collectionValidator } from '#validators/collection';
import type { HttpContext } from '@adonisjs/core/http';

export default class CollectionsController {
  async index({ inertia }: HttpContext) {
    return inertia.render('app');
  }

  async showCreatePage({ inertia }: HttpContext) {
    return inertia.render('collection/create');
  }

  async store({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(collectionValidator);
    const collection = await Collection.create({
      ...payload,
      authorId: auth.user?.id!,
    });
    return this.redirectToCollectionId(response, collection.id);
  }

  private redirectToCollectionId(
    response: HttpContext['response'],
    collectionId: Collection['id']
  ) {
    return response.redirect(`${PATHS.APP}?categoryId=${collectionId}`);
  }
}
