import PATHS from '#constants/paths';
import Collection from '#models/collection';
import { collectionValidator } from '#validators/collection';
import type { HttpContext } from '@adonisjs/core/http';

export default class CollectionsController {
  async index({ auth, inertia }: HttpContext) {
    const collections = await Collection.findManyBy('author_id', auth.user!.id);

    const collectionsWithLinks = await Promise.all(
      collections.map(async (collection) => {
        await collection.load('links');
        return collection;
      })
    );

    return inertia.render('dashboard', { collections: collectionsWithLinks });
  }

  async showCreatePage({ inertia }: HttpContext) {
    return inertia.render('collections/create');
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
    return response.redirect(`${PATHS.DASHBOARD}?collectionId=${collectionId}`);
  }
}
