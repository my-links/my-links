import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const CreateCollectionController = () =>
	import('#controllers/collections/create_collection_controller');
const ShowCollectionController = () =>
	import('#controllers/collections/show_collection_controller');
const UpdateCollectionController = () =>
	import('#controllers/collections/update_collection_controller');
const DeleteCollectionController = () =>
	import('#controllers/collections/delete_collection_controller');

router
	.group(() => {
		router
			.group(() => {
				router
					.post('/', [CreateCollectionController, 'execute'])
					.as('collection.create');

				router
					.get('/:id', [ShowCollectionController, 'render'])
					.as('collection.show');

				router
					.put('/:id', [UpdateCollectionController, 'execute'])
					.as('collection.edit');

				router
					.delete('/:id', [DeleteCollectionController, 'execute'])
					.as('collection.delete');
			})
			.prefix('/collections');
	})
	.middleware([middleware.auth()]);
