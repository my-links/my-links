import { controllers } from '#generated/controllers';
import { apiGroup } from '#routes/api/group';
import router from '@adonisjs/core/services/router';

apiGroup(() => {
	router
		.get('/links/favorites', [controllers.api.links.GetFavoriteLinks, 'render'])
		.as('api-favorites.index');
});
