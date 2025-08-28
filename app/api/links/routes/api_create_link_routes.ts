import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const CreateLinkController = () =>
	import('#api/links/controllers/create_link_controller');

router
	.group(() => {
		router.post('', [CreateLinkController, 'execute']).as('api-links.create');
	})
	.prefix('/api/v1/links')
	.middleware([middleware.auth({ guards: ['api'] })]);
