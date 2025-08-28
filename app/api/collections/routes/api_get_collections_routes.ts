import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const GetCollectionsController = () =>
	import('#api/collections/controllers/get_collections_controller');

router
	.group(() => {
		router
			.get('', [GetCollectionsController, 'show'])
			.as('api-collections.index');
	})
	.prefix('/api/v1/collections')
	.middleware([middleware.auth({ guards: ['api'] })]);
