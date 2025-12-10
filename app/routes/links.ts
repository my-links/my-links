import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const CreateLinkController = () =>
	import('#controllers/links/create_link_controller');
const DeleteLinkController = () =>
	import('#controllers/links/delete_link_controller');
const UpdateLinkController = () =>
	import('#controllers/links/update_link_controller');
const ToggleFavoriteController = () =>
	import('#controllers/links/toggle_favorite_controller');

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
