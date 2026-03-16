import { controllers } from '#generated/controllers';
import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

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
	})
	.prefix('/api/v1/links')
	.middleware([middleware.auth({ guards: ['api'] })]);
