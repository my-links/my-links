import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const ShowCollectionsController = () =>
	import('#controllers/collections/show_collections_controller');
const CreateCollectionController = () =>
	import('#controllers/collections/create_collection_controller');
const UpdateCollectionController = () =>
	import('#controllers/collections/update_collection_controller');
const DeleteCollectionController = () =>
	import('#controllers/collections/delete_collection_controller');

router
	.group(() => {
		router
			.get('/dashboard', [ShowCollectionsController, 'render'])
			.as('dashboard');

		router
			.group(() => {
				router
					.get('/create', [CreateCollectionController, 'render'])
					.as('collection.create-form');
				router
					.post('/', [CreateCollectionController, 'execute'])
					.as('collection.create');

				router
					.get('/edit', [UpdateCollectionController, 'render'])
					.as('collection.edit-form');
				router
					.put('/:id', [UpdateCollectionController, 'execute'])
					.as('collection.edit');

				router
					.get('/delete', [DeleteCollectionController, 'render'])
					.as('collection.delete-form');
				router
					.delete('/:id', [DeleteCollectionController, 'execute'])
					.as('collection.delete');
			})
			.prefix('/collections');
	})
	.middleware([middleware.auth()]);
