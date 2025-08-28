import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const DeleteLinkController = () =>
	import('#api/links/controllers/delete_link_controller');

router
	.group(() => {
		router
			.delete('/:id', [DeleteLinkController, 'execute'])
			.as('api-links.delete');
	})
	.prefix('/api/v1/links')
	.middleware([middleware.auth({ guards: ['api'] })]);
