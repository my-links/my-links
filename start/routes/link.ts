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
  })
  .middleware([middleware.auth()])
  .prefix('/links');
