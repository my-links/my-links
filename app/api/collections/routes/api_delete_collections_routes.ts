import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const DeleteCollectionsController = () =>
	import('#api/collections/controllers/delete_collection_controller');

router
	.group(() => {
		router
			.delete('/:id', [DeleteCollectionsController, 'execute'])
			.as('api-collections.delete');
	})
	.prefix('/api/v1/collections')
	.middleware([middleware.auth({ guards: ['api'] })]);
