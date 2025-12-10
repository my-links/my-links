import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const SearchController = () => import('#controllers/search/search_controller');

router
	.group(() => {
		router.get('/search', [SearchController, 'render']).as('search');
	})
	.middleware([middleware.auth()]);
