import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const SearchesController = () =>
	import('#search/controllers/search_controller');

/**
 * Search routes
 */
router
	.group(() => {
		router.get('/search', [SearchesController, 'search']).as('search');
	})
	.middleware([middleware.auth()]);
