import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';
const LinksController = () => import('#controllers/links_controller');

/**
 * Routes for authenticated users
 */
router
  .group(() => {
    router
      .get('/create', [LinksController, 'showCreatePage'])
      .as('link.create-form');
    router.post('/', [LinksController, 'store']).as('link.create');

    router.get('/edit', [LinksController, 'showEditPage']).as('link.edit-form');
    router.put('/:id', [LinksController, 'update']).as('link.edit');

    router
      .put('/:id/favorite', [LinksController, 'toggleFavorite'])
      .as('link.toggle-favorite');

    router.get('/delete', () => 'delete').as('link.delete-form');
  })
  .middleware([middleware.auth()])
  .prefix('/links');
