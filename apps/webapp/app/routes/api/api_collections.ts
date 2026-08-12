import router from '@adonisjs/core/services/router';

import { controllers } from '#generated/controllers';
import { apiMiddleware } from '#routes/api/api_middleware';

router
	.group(() => {
		router
			.get('', [controllers.api.collections.GetCollections, 'render'])
			.as('api-collections.index');
		router
			.post('', [controllers.api.collections.CreateCollection, 'execute'])
			.as('api-collections.create');
		router
			.put('/:id', [controllers.api.collections.UpdateCollection, 'execute'])
			.as('api-collections.update');
		router
			.delete('/:id', [controllers.api.collections.DeleteCollection, 'execute'])
			.as('api-collections.delete');
		router
			.put('/owned/reorder', [
				controllers.api.collections.ReorderOwnedCollections,
				'execute',
			])
			.as('api-collections.reorder-owned');
		router
			.put('/followed/reorder', [
				controllers.api.collections.ReorderFollowedCollections,
				'execute',
			])
			.as('api-collections.reorder-followed');
		router
			.put('/:id/links/reorder', [
				controllers.api.collections.ReorderCollectionLinks,
				'execute',
			])
			.as('api-collections.reorder-links');
	})
	.prefix('/api/v1/collections')
	.middleware(apiMiddleware);
