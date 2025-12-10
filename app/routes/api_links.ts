import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const CreateLinkController = () =>
	import('#controllers/api/links/create_link_controller');
const UpdateLinkController = () =>
	import('#controllers/api/links/update_link_controller');
const DeleteLinkController = () =>
	import('#controllers/api/links/delete_link_controller');
const GetFavoriteLinksController = () =>
	import('#controllers/api/links/get_favorite_links_controller');

router
	.group(() => {
		router.post('', [CreateLinkController, 'execute']).as('api-links.create');
		router
			.put('/:id', [UpdateLinkController, 'execute'])
			.as('api-links.update');
		router
			.delete('/:id', [DeleteLinkController, 'execute'])
			.as('api-links.delete');
	})
	.prefix('/api/v1/links')
	.middleware([middleware.auth({ guards: ['api'] })]);

router
	.group(() => {
		router
			.get('', [GetFavoriteLinksController, 'execute'])
			.as('api-links.get-favorite-links');
	})
	.prefix('/api/v1/links/favorites')
	.middleware([middleware.auth({ guards: ['api'] })]);
