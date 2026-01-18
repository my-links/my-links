import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const GetCollectionsController = () =>
	import('#controllers/api/collections/get_collections_controller');
const CreateCollectionsController = () =>
	import('#controllers/api/collections/create_collection_controller');
const UpdateCollectionsController = () =>
	import('#controllers/api/collections/update_collection_controller');
const DeleteCollectionsController = () =>
	import('#controllers/api/collections/delete_collection_controller');

router
	.group(() => {
		router
			.get('', [GetCollectionsController, 'render'])
			.as('api-collections.index');
		router
			.post('', [CreateCollectionsController, 'execute'])
			.as('api-collections.create');
		router
			.put('/:id', [UpdateCollectionsController, 'execute'])
			.as('api-collections.update');
		router
			.delete('/:id', [DeleteCollectionsController, 'execute'])
			.as('api-collections.delete');
	})
	.prefix('/api/v1/collections')
	.middleware([middleware.auth({ guards: ['api'] })]);
