import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const UpdateCollectionsController = () =>
	import('#api/collections/controllers/update_collection_controller');

router
	.group(() => {
		router
			.put('/:id', [UpdateCollectionsController, 'execute'])
			.as('api-collections.update');
	})
	.prefix('/api/v1/collections')
	.middleware([middleware.auth({ guards: ['api'] })]);
