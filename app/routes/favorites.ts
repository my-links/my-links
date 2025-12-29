import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const ShowFavoritesController = () =>
	import('#controllers/favorites/show_favorites_controller');

router
	.group(() => {
		router.get('', [ShowFavoritesController, 'render']).as('favorites.show');
	})
	.prefix('/favorites')
	.middleware([middleware.auth()]);
