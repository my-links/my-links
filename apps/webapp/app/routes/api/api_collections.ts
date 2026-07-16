import router from '@adonisjs/core/services/router';

import { middleware } from '#start/kernel';
import { controllers } from '#generated/controllers';

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
	})
	.prefix('/api/v1/collections')
	.middleware([middleware.auth({ guards: ['api'] })]);
