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
const FollowCollectionController = () =>
	import('#controllers/collections/follow_collection_controller');
const UnfollowCollectionController = () =>
	import('#controllers/collections/unfollow_collection_controller');
const ShowFavoritesController = () =>
	import('#controllers/favorites/show_favorites_controller');

router
	.group(() => {
		router
			.group(() => {
				router
					.post('/', [CreateCollectionController, 'execute'])
					.as('collection.create');

				router
					.get('/favorites', [ShowFavoritesController, 'render'])
					.as('collection.favorites');

				router
					.get('/:id', [ShowCollectionController, 'render'])
					.as('collection.show');

				router
					.put('/:id', [UpdateCollectionController, 'execute'])
					.as('collection.edit');

				router
					.delete('/:id', [DeleteCollectionController, 'execute'])
					.as('collection.delete');

				router
					.post('/:id/follow', [FollowCollectionController, 'execute'])
					.as('collection.follow');

				router
					.post('/:id/unfollow', [UnfollowCollectionController, 'execute'])
					.as('collection.unfollow');
			})
			.prefix('/collections');
	})
	.middleware([middleware.auth()]);
