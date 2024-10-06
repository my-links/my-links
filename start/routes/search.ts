import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const SearchesController = () => import('#controllers/searches_controller');

/**
 * Search routes
 */
router
	.group(() => {
		router.get('/search', [SearchesController, 'search']).as('search');
	})
	.middleware([middleware.auth()]);
