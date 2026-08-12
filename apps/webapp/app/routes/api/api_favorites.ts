import router from '@adonisjs/core/services/router';

import { controllers } from '#generated/controllers';
import { apiMiddleware } from '#routes/api/api_middleware';

router
	.group(() => {
		router
			.get('', [controllers.api.links.GetFavoriteLinks, 'render'])
			.as('api-favorites.index');
	})
	.prefix('/api/v1/links/favorites')
	.middleware(apiMiddleware);
