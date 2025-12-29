import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const CreateLinkController = () =>
	import('#controllers/links/create_link_controller');
const UpdateLinkController = () =>
	import('#controllers/links/update_link_controller');
const ToggleFavoriteController = () =>
	import('#controllers/links/toggle_favorite_controller');
const DeleteLinkController = () =>
	import('#controllers/links/delete_link_controller');

router
	.group(() => {
		router.post('/', [CreateLinkController, 'execute']).as('link.create');

		router.put('/:id', [UpdateLinkController, 'execute']).as('link.edit');

		router
			.put('/:id/favorite', [ToggleFavoriteController, 'execute'])
			.as('link.toggle-favorite');

		router.delete('/:id', [DeleteLinkController, 'execute']).as('link.delete');
	})
	.middleware([middleware.auth()])
	.prefix('/links');
