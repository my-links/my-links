import { controllers } from '#generated/controllers';
import { apiGroupAuth } from '#routes/groups/api_group';
import router from '@adonisjs/core/services/router';

apiGroupAuth(() => {
	router
		.get('/links/favorites', [controllers.api.links.GetFavoriteLinks, 'render'])
		.as('api-favorites.index');
});
