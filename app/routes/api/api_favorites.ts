import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const GetFavoriteLinksController = () =>
	import('#controllers/api/links/get_favorite_links_controller');

router
	.group(() => {
		router
			.get('', [GetFavoriteLinksController, 'render'])
			.as('api-favorites.index');
	})
	.prefix('/api/v1/links/favorites')
	.middleware([middleware.auth({ guards: ['api'] })]);
