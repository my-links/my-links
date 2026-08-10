import router from '@adonisjs/core/services/router';

import { middleware } from '#start/kernel';
import { controllers } from '#generated/controllers';

router
	.group(() => {
		router
			.group(() => {
				router
					.post('/', [controllers.collections.CreateCollection, 'execute'])
					.as('collection.create');

				router
					.get('/favorites', [controllers.favorites.ShowFavorites, 'render'])
					.as('collection.favorites');

				router
					.get('/inbox', [controllers.collections.ShowInbox, 'render'])
					.as('collection.inbox');

				router
					.put('/owned/reorder', [
						controllers.collections.ReorderOwnedCollections,
						'execute',
					])
					.as('collection.reorder-owned');

				router
					.put('/followed/reorder', [
						controllers.collections.ReorderFollowedCollections,
						'execute',
					])
					.as('collection.reorder-followed');

				router
					.put('/:id/links/reorder', [
						controllers.collections.ReorderCollectionLinks,
						'execute',
					])
					.as('collection.reorder-links');

				router
					.get('/:id', [controllers.collections.ShowCollection, 'render'])
					.as('collection.show');

				router
					.put('/:id', [controllers.collections.UpdateCollection, 'execute'])
					.as('collection.edit');

				router
					.delete('/:id', [controllers.collections.DeleteCollection, 'execute'])
					.as('collection.delete');

				router
					.post('/:id/follow', [
						controllers.collections.FollowCollection,
						'execute',
					])
					.as('collection.follow');

				router
					.post('/:id/unfollow', [
						controllers.collections.UnfollowCollection,
						'execute',
					])
					.as('collection.unfollow');
			})
			.prefix('/collections');
	})
	.middleware([middleware.auth()]);
