import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';
const CollectionsController = () =>
  import('#controllers/collections_controller');

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

        router
          .get('/delete', [CollectionsController, 'showDeletePage'])
          .as('collection.delete-form');
        router
          .delete('/:id', [CollectionsController, 'delete'])
          .as('collection.delete');
      })
      .prefix('/collections');
  })
  .middleware([middleware.auth()]);
