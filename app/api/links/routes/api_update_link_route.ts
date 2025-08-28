import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const UpdateLinkController = () =>
	import('#api/links/controllers/update_link_controller');

router
	.group(() => {
		router
			.put('/:id', [UpdateLinkController, 'execute'])
			.as('api-links.update');
	})
	.prefix('/api/v1/links')
	.middleware([middleware.auth({ guards: ['api'] })]);
