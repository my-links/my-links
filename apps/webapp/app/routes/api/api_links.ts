import router from '@adonisjs/core/services/router';

import { controllers } from '#generated/controllers';
import { apiMiddleware } from '#routes/api/api_middleware';

router
	.group(() => {
		router
			.post('', [controllers.api.links.CreateLink, 'execute'])
			.as('api-links.create');
		router
			.put('/:id', [controllers.api.links.UpdateLink, 'execute'])
			.as('api-links.update');
		router
			.delete('/:id', [controllers.api.links.DeleteLink, 'execute'])
			.as('api-links.delete');
		router
			.put('/:id/collection', [controllers.api.links.MoveLink, 'execute'])
			.as('api-links.move-to-collection');
		router
			.post('/:id/collections', [
				controllers.api.links.AddLinkToCollection,
				'execute',
			])
			.as('api-links.add-to-collection');
	})
	.prefix('/api/v1/links')
	.middleware(apiMiddleware);
