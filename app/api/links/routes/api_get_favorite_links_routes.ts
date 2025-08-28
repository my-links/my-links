import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const GetFavoriteLinksController = () =>
	import('#api/links/controllers/get_favorite_links_controller');

router
	.group(() => {
		router
			.get('', [GetFavoriteLinksController, 'execute'])
			.as('api-links.get-favorite-links');
	})
	.prefix('/api/v1/links/favorites')
	.middleware([middleware.auth({ guards: ['api'] })]);
