import router from '@adonisjs/core/services/router';

import { middleware } from '#start/kernel';
import { controllers } from '#generated/controllers';

router
	.group(() => {
		router
			.get('', [controllers.api.links.GetFavoriteLinks, 'render'])
			.as('api-favorites.index');
	})
	.prefix('/api/v1/links/favorites')
	.middleware([middleware.auth({ guards: ['api'] })]);
