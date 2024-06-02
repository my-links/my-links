import { Visibility } from '#enums/visibility';
import Collection from '#models/collection';
import { getSharedCollectionValidator } from '#validators/shared_collection';
import type { HttpContext } from '@adonisjs/core/http';

export default class SharedCollectionsController {
  async index({ request, inertia }: HttpContext) {
    const { params } = await request.validateUsing(
      getSharedCollectionValidator
    );

    const collection = await this.getSharedCollectionById(params.id);
    return inertia.render('shared', { collection });
  }

  private async getSharedCollectionById(id: Collection['id']) {
    return await Collection.query()
      .where('id', id)
      .andWhere('visibility', Visibility.PUBLIC)
      .preload('links')
      .preload('author')
      .firstOrFail();
  }
}
