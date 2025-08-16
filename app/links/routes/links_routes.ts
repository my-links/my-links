import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const CreateLinkController = () =>
	import('#links/controllers/create_link_controller');
const DeleteLinkController = () =>
	import('#links/controllers/delete_link_controller');
const UpdateLinkController = () =>
	import('#links/controllers/update_link_controller');
const ToggleFavoriteController = () =>
	import('#links/controllers/toggle_favorite_controller');

/**
 * Routes for authenticated users
 */
router
	.group(() => {
		router
			.get('/create', [CreateLinkController, 'render'])
			.as('link.create-form');
		router.post('/', [CreateLinkController, 'execute']).as('link.create');

		router.get('/edit', [UpdateLinkController, 'render']).as('link.edit-form');
		router.put('/:id', [UpdateLinkController, 'execute']).as('link.edit');

		router
			.put('/:id/favorite', [ToggleFavoriteController, 'toggleFavorite'])
			.as('link.toggle-favorite');

		router
			.get('/delete', [DeleteLinkController, 'render'])
			.as('link.delete-form');
		router.delete('/:id', [DeleteLinkController, 'execute']).as('link.delete');
	})
	.middleware([middleware.auth()])
	.prefix('/links');
