import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

const ShowCollectionsController = () =>
	import('#collections/controllers/show_collections_controller');
const CreateCollectionController = () =>
	import('#collections/controllers/create_collection_controller');
const UpdateCollectionController = () =>
	import('#collections/controllers/update_collection_controller');
const DeleteCollectionController = () =>
	import('#collections/controllers/delete_collection_controller');

router
	.group(() => {
		router
			.get('/dashboard', [ShowCollectionsController, 'render'])
			.as('dashboard');

		router
			.group(() => {
				// Create
				router
					.get('/create', [CreateCollectionController, 'render'])
					.as('collection.create-form');
				router
					.post('/', [CreateCollectionController, 'execute'])
					.as('collection.create');

				// Update
				router
					.get('/edit', [UpdateCollectionController, 'render'])
					.as('collection.edit-form');
				router
					.put('/:id', [UpdateCollectionController, 'execute'])
					.as('collection.edit');

				// Delete
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
