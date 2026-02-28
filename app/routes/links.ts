import { controllers } from '#generated/controllers';
import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

router
	.group(() => {
		router
			.post('/', [controllers.links.CreateLink, 'execute'])
			.as('link.create');

		router
			.put('/:id', [controllers.links.UpdateLink, 'execute'])
			.as('link.edit');

		router
			.put('/:id/favorite', [controllers.links.ToggleFavorite, 'execute'])
			.as('link.toggle-favorite');

		router
			.delete('/:id', [controllers.links.DeleteLink, 'execute'])
			.as('link.delete');
	})
	.middleware([middleware.auth()])
	.prefix('/links');
