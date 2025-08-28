import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const CreateCollectionsController = () =>
	import('#api/collections/controllers/create_collection_controller');

router
	.group(() => {
		router
			.post('', [CreateCollectionsController, 'execute'])
			.as('api-collections.create');
	})
	.prefix('/api/v1/collections')
	.middleware([middleware.auth({ guards: ['api'] })]);
