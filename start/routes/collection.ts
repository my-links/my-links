import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';
const CollectionsController = () =>
  import('#controllers/collections_controller');

/**
 * Routes for authenticated users
 */
router
  .group(() => {
    router.get('/dashboard', [CollectionsController, 'index']).as('dashboard');

    router
      .group(() => {
        router
          .get('/create', [CollectionsController, 'showCreatePage'])
          .as('collection.create-form');
        router
          .post('/', [CollectionsController, 'store'])
          .as('collection.create');

        router
          .get('/edit', [CollectionsController, 'showEditPage'])
          .as('collection.edit-form');
        router
          .put('/:id', [CollectionsController, 'update'])
          .as('collection.edit');

        router.get('/delete', () => 'delete').as('collection.delete-form');
      })
      .prefix('/collections');
  })
  .middleware([middleware.auth()]);
